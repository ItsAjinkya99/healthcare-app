const router = require("express").Router();
const { verifyToken } = require("../middleware/auth.middleware");

// Example protected route
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user
  });
});

module.exports = router;
