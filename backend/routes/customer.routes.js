const { Router } = require("express");
const { getMenu, placeOrder, getOrderStatus, callWaiter, requestBill, getTableOrders } = require("../controller/customer.controller");

const router = Router();

// These routes do NOT require authentication (verifyJWT)
// Example: /api/v1/public/:hotelId/menu
router.route("/:hotelId/menu").get(getMenu);
router.route("/:hotelId/order").post(placeOrder);
router.route("/:hotelId/order/:orderId").get(getOrderStatus);

router.route("/:hotelId/table/:tableId/call-waiter").post(callWaiter);
router.route("/:hotelId/table/:tableId/request-bill").post(requestBill);
router.route("/:hotelId/table/:tableId/orders").get(getTableOrders);


module.exports = router;
