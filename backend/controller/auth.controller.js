const User = require("../modal/user.modal");
const Hotel = require("../modal/hotel.modal");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('req.body', req.body)

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked by the SuperAdmin.");
  }

  const accessToken = user.generateAccessToken();

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged In Successfully"
      )
    );
});

// For MVP, superadmin can create a hotel and manager together
const createManagerAndHotel = asyncHandler(async (req, res) => {
  const { managerName, managerEmail, managerPassword, hotelName, hotelAddress, hotelPhone, latitude, longitude } = req.body;

  if (!managerName || !managerEmail || !managerPassword || !hotelName || !hotelAddress || !hotelPhone) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email: managerEmail });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Create Hotel Data
  const hotelData = {
    name: hotelName,
    address: hotelAddress,
    phone: hotelPhone,
  };

  if (latitude !== undefined && longitude !== undefined) {
    hotelData.location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }

  // Create Hotel
  const hotel = await Hotel.create(hotelData);

  // Create Manager
  const manager = await User.create({
    username: managerName,
    email: managerEmail,
    password: managerPassword,
    role: "MANAGER",
    hotelId: hotel._id,
  });

  const createdManager = await User.findById(manager._id).select("-password");

  return res.status(201).json(
    new ApiResponse(201, { hotel, manager: createdManager }, "Hotel and Manager created successfully")
  );
});

// Helper endpoint to create the very first Super Admin
const setupSuperAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if any SUPERADMIN already exists
  const existingSuperAdmin = await User.findOne({ role: "SUPERADMIN" });
  if (existingSuperAdmin) {
    throw new ApiError(403, "Super Admin already exists. Cannot create another one directly.");
  }

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const superAdmin = await User.create({
    username,
    email,
    password,
    role: "SUPERADMIN"
    // no hotelId needed for superadmin
  });

  const createdAdmin = await User.findById(superAdmin._id).select("-password");

  return res.status(201).json(
    new ApiResponse(201, createdAdmin, "Super Admin created successfully. You can now login.")
  );
});

const registerUser = asyncHandler(async (req, res) => {
  const { managerName, managerEmail, managerPassword, hotelName, hotelAddress, hotelPhone } = req.body;

  if (!managerName || !managerEmail || !managerPassword || !hotelName || !hotelAddress || !hotelPhone) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email: managerEmail });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const hotelData = {
    name: hotelName,
    address: hotelAddress,
    phone: hotelPhone,
  };

  const hotel = await Hotel.create(hotelData);

  const manager = await User.create({
    username: managerName,
    email: managerEmail,
    password: managerPassword,
    role: "MANAGER",
    hotelId: hotel._id,
  });

  const createdManager = await User.findById(manager._id).select("-password");
  const accessToken = manager.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(201, { user: createdManager, hotel, accessToken }, "Cafe registered successfully")
    );
});

module.exports = {
  loginUser,
  createManagerAndHotel,
  setupSuperAdmin,
  registerUser
};
