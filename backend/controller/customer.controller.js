const MenuItem = require("../modal/menuItem.modal");
const Table = require("../modal/table.modal");
const Order = require("../modal/order.modal");
const Hotel = require("../modal/hotel.modal");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const getMenu = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  const menuItems = await MenuItem.find({ hotelId, isAvailable: true });

  return res
    .status(200)
    .json(new ApiResponse(200, menuItems, "Menu fetched successfully"));
});

// Helper: Haversine formula to calculate distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const placeOrder = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { tableId, items, customerNotes, customerLat, customerLng, customerName, customerPhone } = req.body;

  if (!tableId || !items || items.length === 0) {
    throw new ApiError(400, "Table ID and items are required");
  }

  if (!customerName || !customerPhone) {
    throw new ApiError(400, "Customer name and phone are required for accountability");
  }

  // 1. Geofencing Validation
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  // Only check distance if the hotel has location set up
  if (hotel.location && hotel.location.latitude && hotel.location.longitude) {
    if (!customerLat || !customerLng) {
      throw new ApiError(400, "Please enable GPS to place an order from your location.");
    }

    const distance = calculateDistance(
      parseFloat(customerLat),
      parseFloat(customerLng),
      hotel.location.latitude,
      hotel.location.longitude
    );

    // If customer is more than 200 meters away, reject the order
    if (distance > 200) {
      throw new ApiError(403, `You are too far from the hotel to place an order. (Distance: ${Math.round(distance)}m)`);
    }
  }

  // Verify Table
  const table = await Table.findOne({ _id: tableId, hotelId });
  if (!table) {
    throw new ApiError(404, "Invalid Table");
  }

  // Calculate Total & Validate Items
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findOne({ _id: item.menuItem, hotelId });
    if (!menuItem) {
      throw new ApiError(404, `Menu item ${item.menuItem} not found`);
    }

    const price = menuItem.price;
    totalAmount += price * item.quantity;

    orderItems.push({
      menuItem: menuItem._id,
      quantity: item.quantity,
      price: price, // price at the time of order
      notes: item.notes || "",
    });
  }

  // Generate a random order number (e.g., #1024)
  const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();

  const order = await Order.create({
    hotelId,
    tableId,
    orderNumber,
    items: orderItems,
    totalAmount,
    customerNotes,
    customerName,
    customerPhone
  });

  // Emit real-time notification to the Manager
  const io = req.app.get("io");
  if (io) {
    io.to(hotelId.toString()).emit("newOrder", {
      message: `New order placed at Table ${table.tableNumber}`,
      orderId: order._id,
      tableId: table._id,
      tableNumber: table.tableNumber,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

const getOrderStatus = asyncHandler(async (req, res) => {
  const { hotelId, orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, hotelId })
    .populate("items.menuItem", "name isVeg")
    .select("-hotelId -updatedAt");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status fetched"));
});

const callWaiter = asyncHandler(async (req, res) => {
  const { hotelId, tableId } = req.params;

  const table = await Table.findOneAndUpdate(
    { _id: tableId, hotelId },
    { waiterRequested: true },
    { new: true }
  );

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // Emit real-time notification to the Manager
  const io = req.app.get("io");
  if (io) {
    io.to(hotelId.toString()).emit("callWaiter", {
      message: `Waiter called at Table ${table.tableNumber}`,
      tableId: table._id,
      tableNumber: table.tableNumber,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, table, "Waiter has been notified."));
});

const requestBill = asyncHandler(async (req, res) => {
  const { hotelId, tableId } = req.params;

  const table = await Table.findOneAndUpdate(
    { _id: tableId, hotelId },
    { billRequested: true },
    { new: true }
  );

  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // Emit real-time notification to the Manager
  const io = req.app.get("io");
  if (io) {
    io.to(hotelId.toString()).emit("requestBill", {
      message: `Bill requested at Table ${table.tableNumber}`,
      tableId: table._id,
      tableNumber: table.tableNumber,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, table, "Bill has been requested."));
});


const getTableOrders = asyncHandler(async (req, res) => {
  const { hotelId, tableId } = req.params;

  const orders = await Order.find({
    hotelId,
    tableId,
    status: { $in: ["PENDING", "ACCEPTED", "COMPLETED"] }
  })
    .populate("items.menuItem", "name price isVeg")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Table orders fetched successfully"));
});

module.exports = {
  getMenu,
  placeOrder,
  getOrderStatus,
  callWaiter,
  requestBill,
  getTableOrders
};
