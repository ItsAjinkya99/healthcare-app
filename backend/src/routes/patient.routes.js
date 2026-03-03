const router = require("express").Router();
const patientController = require("../controllers/patient.controller");

router.get("/patients", patientController.getPatients);

module.exports = router;