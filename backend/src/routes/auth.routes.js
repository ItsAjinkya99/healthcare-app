
const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);


// router.get("/doctors", controller.getDoctors);



module.exports = router;
