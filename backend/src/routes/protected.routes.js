const router = require("express").Router();
const { verifyToken } = require("../middleware/auth.middleware");
const patientsController = require("../controllers/patient.controller");

// Example protected route
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user
  });
});

console.log("reached here");
router.get("/patients", verifyToken, patientsController.getPatients);
router.post("/patients", verifyToken, patientsController.createPatient);

module.exports = router;
