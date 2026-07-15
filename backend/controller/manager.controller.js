const MenuItem = require("../modal/menuItem.modal.js");
const Table = require("../modal/table.modal.js");
const Order = require("../modal/order.modal.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { ApiError } = require("../utils/ApiError.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const QRCode = require("qrcode");
const User = require("../modal/user.modal.js");
const Hotel = require("../modal/hotel.modal.js");
const dayjs = require("dayjs");

// --- MenuItem Management ---
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, isVeg, category } = req.body;
  const hotelId = req.user.hotelId;

  if (!name || !price) {
    throw new ApiError(400, "Name and price are required");
  }

  // Handle image upload via Cloudinary
  let imageUrl = "";
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      imageUrl = cloudinaryResponse.url;
    }
  }

  const menuItem = await MenuItem.create({
    hotelId,
    name,
    description,
    price,
    isVeg,
    category: category || "Uncategorized",
    image: imageUrl
  });

  return res.status(201).json(new ApiResponse(201, menuItem, "Menu Item created successfully"));
});

const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({ hotelId: req.user.hotelId });
  return res.status(200).json(new ApiResponse(200, menuItems, "Menu Items fetched successfully"));
});

// --- Table Management ---
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.body;
  const hotelId = req.user.hotelId;

  if (!tableNumber) {
    throw new ApiError(400, "Table number is required");
  }

  const table = await Table.create({ hotelId, tableNumber });

  // URL to redirect customer to
  const tableUrl = `https://omni-bite.vercel.app/menu/${hotelId}?tableId=${table._id}&tableNumber=${encodeURIComponent(table.tableNumber)}`;

  // Generate actual QR Code image (Base64 format)
  const qrCodeImage = await QRCode.toDataURL(tableUrl);

  table.qrCode = qrCodeImage;
  await table.save();

  // Return both table and URL so you can test easily
  return res.status(201).json(new ApiResponse(201, { table, url: tableUrl }, "Table created successfully with QR code"));
});

const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ hotelId: req.user.hotelId });
  return res.status(200).json(new ApiResponse(200, tables, "Tables fetched successfully"));
});

// Clear Table (Resets table flags and forces active orders to COMPLETED)
const clearTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  const hotelId = req.user.hotelId;

  // 1. Force complete all active orders for this table (we use ACCEPTED as final state now)
  await Order.updateMany(
    { tableId, hotelId, status: { $nin: ["ACCEPTED", "CANCELLED"] } },
    { $set: { status: "ACCEPTED" } }
  );

  // 2. Reset the table notification flags
  const table = await Table.findOneAndUpdate(
    { _id: tableId, hotelId },
    { billRequested: false, waiterRequested: false },
    { new: true }
  );

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  return res.status(200).json(new ApiResponse(200, table, "Table cleared successfully and orders completed"));
});

const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  const hotelId = req.user.hotelId;

  // Ensure table exists and belongs to this hotel
  const table = await Table.findOne({ _id: tableId, hotelId });
  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // Prevent deleting a table that has active orders
  const activeOrdersCount = await Order.countDocuments({
    tableId,
    hotelId,
    status: { $nin: ["ACCEPTED", "CANCELLED"] }
  });

  if (activeOrdersCount > 0) {
    throw new ApiError(400, "Cannot delete a table with active orders. Please clear the table first.");
  }

  await Table.findByIdAndDelete(tableId);

  return res.status(200).json(new ApiResponse(200, {}, "Table deleted successfully"));
});

// --- Analytics ---
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const hotelId = req.user.hotelId;
  const { filter, startDate, endDate } = req.query;

  let query = { hotelId };

  if (filter && filter !== 'all') {
    const now = dayjs();
    let start, end;

    switch (filter) {
      case "today":
        start = now.startOf("day");
        end = now.endOf("day");
        break;
      case "week":
        start = now.subtract(7, "day").startOf("day");
        end = now.endOf("day");
        break;
      case "month":
        start = now.startOf("month");
        end = now.endOf("day");
        break;
      case "3months":
        start = now.subtract(3, "month").startOf("month");
        end = now.endOf("day");
        break;
      case "6months":
        start = now.subtract(6, "month").startOf("month");
        end = now.endOf("day");
        break;
      case "year":
        start = now.startOf("year");
        end = now.endOf("day");
        break;
      case "custom":
        if (startDate && endDate) {
          start = dayjs(startDate).startOf("day");
          end = dayjs(endDate).endOf("day");
        } else {
          throw new ApiError(400, "startDate and endDate are required for custom filter");
        }
        break;
    }

    if (start && end) {
      query.createdAt = {
        $gte: start.toDate(),
        $lte: end.toDate(),
      };
    }
  }

  // Total Orders & Revenue
  const orders = await Order.find(query);
  const totalOrders = orders.length;
  // Calculate revenue only for ACCEPTED orders
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED");
  const totalRevenue = acceptedOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  // Occupied Tables (Tables with active orders)
  const activeOrders = orders.filter((o) => ["PENDING", "ACCEPTED"].includes(o.status));
  const occupiedTableIds = new Set(activeOrders.map((o) => o.tableId.toString()));
  const occupiedTablesCount = occupiedTableIds.size;

  // Simple aggregation for most/least ordered items
  const itemCounts = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const itemId = item.menuItem.toString();
      itemCounts[itemId] = (itemCounts[itemId] || 0) + item.quantity;
    });
  });

  const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
  const itemIds = sortedItems.map(([itemId]) => itemId);
  const menuItems = await MenuItem.find({ _id: { $in: itemIds }, hotelId }).select("name price");
  const menuItemsById = new Map(menuItems.map((item) => [item._id.toString(), item]));
  const toOrderedItem = ([itemId, count]) => ({
    _id: itemId,
    count,
    menuItem: menuItemsById.get(itemId) || null,
  });
  const mostOrdered = sortedItems.slice(0, 5).map(toOrderedItem);
  const leastOrdered = sortedItems.slice(-5).reverse().map(toOrderedItem);

  const analytics = {
    totalOrders,
    totalRevenue,
    occupiedTables: occupiedTablesCount,
    mostOrderedItems: mostOrdered,
    leastOrderedItems: leastOrdered,
  };

  return res.status(200).json(new ApiResponse(200, analytics, "Analytics fetched successfully"));
});

// --- Profile / Hotel Update ---
const getProfile = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.user.hotelId);
  return res.status(200).json(
    new ApiResponse(200, { user: req.user, hotel }, "Profile fetched successfully")
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, hotelName, address, phone, latitude, longitude } = req.body;

  // 1. Update User (Manager)
  const userUpdates = {};
  if (username) userUpdates.username = username;
  // if (email) userUpdates.email = email;

  let updatedUser = req.user;
  if (Object.keys(userUpdates).length > 0) {
    updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true }).select("-password");
  }

  // 2. Update Hotel
  const hotelUpdates = {};
  if (hotelName) hotelUpdates.name = hotelName;
  if (address) hotelUpdates.address = address;
  if (phone) hotelUpdates.phone = phone;

  if (latitude !== undefined && longitude !== undefined) {
    hotelUpdates.location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }

  // Handle Logo Upload
  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      hotelUpdates.logo = cloudinaryResponse.url;
    }
  }

  let updatedHotel = null;
  if (Object.keys(hotelUpdates).length > 0) {
    updatedHotel = await Hotel.findByIdAndUpdate(req.user.hotelId, hotelUpdates, { new: true });
  } else {
    updatedHotel = await Hotel.findById(req.user.hotelId);
  }

  return res.status(200).json(
    new ApiResponse(200, { user: updatedUser, hotel: updatedHotel }, "Profile and Hotel updated successfully")
  );
});

// --- Order History with Filters ---
const getAllOrders = asyncHandler(async (req, res) => {
  const hotelId = req.user.hotelId;
  const { filter, startDate, endDate } = req.query;

  let query = { hotelId };

  if (filter) {
    const now = dayjs();
    let start, end;

    switch (filter) {
      case "today":
        start = now.startOf("day");
        end = now.endOf("day");
        break;
      case "week":
        start = now.subtract(7, "day").startOf("day");
        end = now.endOf("day");
        break;
      case "month":
        start = now.startOf("month");
        end = now.endOf("day");
        break;
      case "6months":
        start = now.subtract(6, "month").startOf("month");
        end = now.endOf("day");
        break;
      case "year":
        start = now.startOf("year");
        end = now.endOf("day");
        break;
      case "custom":
        if (startDate && endDate) {
          start = dayjs(startDate).startOf("day");
          end = dayjs(endDate).endOf("day");
        } else {
          throw new ApiError(400, "startDate and endDate are required for custom filter");
        }
        break;
    }

    if (start && end) {
      query.createdAt = {
        $gte: start.toDate(),
        $lte: end.toDate(),
      };
    }
  }

  const orders = await Order.find(query)
    .populate("tableId", "tableNumber")
    .populate("items.menuItem", "name price")
    .sort({ createdAt: -1 }); // Newest first

  return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// --- Active Orders Management (Replaced Kitchen) ---
const getActiveOrders = asyncHandler(async (req, res) => {
  const hotelId = req.user.hotelId;

  const orders = await Order.find({
    hotelId,
    status: "PENDING", // Only fetch pending orders for the manager to review
  })
    .populate("tableId", "tableNumber")
    .populate("items.menuItem", "name isVeg")
    .sort({ createdAt: 1 }); // Oldest first

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Active orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const hotelId = req.user.hotelId;

  const validStatuses = ["PENDING", "ACCEPTED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status provided");
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, hotelId },
    { status },
    { new: true }
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Auto-clear table notifications if order is ACCEPTED
  if (status === "ACCEPTED") {
    await Table.findByIdAndUpdate(order.tableId, {
      billRequested: false,
      waiterRequested: false
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, `Order status updated to ${status} and table notifications cleared`));
});

module.exports = {
  createMenuItem,
  getMenuItems,
  createTable,
  getTables,
  clearTable,
  deleteTable,
  getDashboardAnalytics,
  getProfile,
  updateProfile,
  getAllOrders,
  getActiveOrders,
  updateOrderStatus
};
