const { Router } = require("express");
const {
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
} = require("../controller/manager.controller");
const { verifyJWT, restrictTo } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/multer.middleware");

const router = Router();

// Apply middleware to all routes in this file
router.use(verifyJWT);
router.use(restrictTo("MANAGER"));

// Menu Items (accepting multipart/form-data for image)
router.route("/menu-items")
  .post(upload.single("image"), createMenuItem)
  .get(getMenuItems);

// Tables
router.route("/tables").post(createTable).get(getTables);
router.route("/tables/:tableId/clear").post(clearTable);
router.route("/tables/:tableId").delete(deleteTable);

// Analytics
router.route("/dashboard").get(getDashboardAnalytics);

// Update Profile & Hotel Info
router.route("/profile").get(getProfile).put(upload.single("logo"), updateProfile);

// Order History with Filters
router.route("/orders").get(getAllOrders);

// Active Orders & Status Update
router.route("/orders/active").get(getActiveOrders);
router.route("/orders/:orderId/status").patch(updateOrderStatus);

module.exports = router;
