const User = require("../modal/user.modal");
const Hotel = require("../modal/hotel.modal");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");

const getAllManagers = asyncHandler(async (req, res) => {
  // Fetch all managers and populate their hotel details
  const managers = await User.find({ role: "MANAGER" }).populate("hotelId", "name address phone").select("-password");

  return res.status(200).json(
    new ApiResponse(200, managers, "Managers fetched successfully")
  );
});

const toggleBlockManager = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const manager = await User.findById(id);

  if (!manager || manager.role !== "MANAGER") {
    throw new ApiError(404, "Manager not found");
  }

  manager.isBlocked = !manager.isBlocked;
  await manager.save();

  return res.status(200).json(
    new ApiResponse(200, { isBlocked: manager.isBlocked }, `Manager has been ${manager.isBlocked ? 'blocked' : 'unblocked'} successfully`)
  );
});

const Order = require("../modal/order.modal");

const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const totalManagers = await User.countDocuments({ role: "MANAGER" });
  
  // Aggregate orders for total revenue and order count
  const orderStats = await Order.aggregate([
    { $match: { status: "ACCEPTED" } }, // Assuming ACCEPTED means the order is successfully processed
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    totalCafes: totalManagers,
    totalRevenue: orderStats.length > 0 ? orderStats[0].totalRevenue : 0,
    totalOrdersProcessed: orderStats.length > 0 ? orderStats[0].totalOrders : 0
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Platform analytics fetched successfully")
  );
});

module.exports = {
  getAllManagers,
  toggleBlockManager,
  getPlatformAnalytics
};
