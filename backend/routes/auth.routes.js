const { Router } = require("express");
const { loginUser, createManagerAndHotel, registerUser } = require("../controller/auth.controller");
const { verifyJWT, restrictTo } = require("../middlewares/auth.middleware");

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);

// One-time setup route for the first Super Admin (No auth required)
router.route("/setup-superadmin").post(require("../controller/auth.controller").setupSuperAdmin);

// Secured Routes
router.route("/create-manager").post(verifyJWT, restrictTo("SUPERADMIN"), createManagerAndHotel);

module.exports = router;
