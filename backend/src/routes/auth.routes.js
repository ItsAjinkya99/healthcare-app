
const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const patientsController = require("../controllers/patient.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
