const patientModel = require("../models/patient.model");

exports.getPatients = async (req, res) => {
    // Placeholder for fetching patients from the database
    const patients = await patientModel.find({});
    res.status(200).json(patients);
}  