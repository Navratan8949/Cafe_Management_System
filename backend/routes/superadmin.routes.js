const { Router } = require("express");
const { getAllManagers, toggleBlockManager, getPlatformAnalytics } = require("../controller/superadmin.controller");
const { verifyJWT, restrictTo } = require("../middlewares/auth.middleware");

const router = Router();

router.use(verifyJWT, restrictTo("SUPERADMIN")); // Protect all routes

router.route("/analytics").get(getPlatformAnalytics);
router.route("/managers").get(getAllManagers);
router.route("/managers/:id/toggle-block").patch(toggleBlockManager);

module.exports = router;
