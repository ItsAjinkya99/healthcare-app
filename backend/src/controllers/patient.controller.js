const patientModel = require("../models/patient.model");

exports.getPatients = async (req, res) => {
    // Placeholder for fetching patients from the database
    console.log("Fetching patients for user:", req.user);
    const patients = await patientModel.find({});
    res.status(200).json(patients);
};

exports.createPatient = async (req, res) => {
    try {
        const { name, email, age, gender } = req.body;

        // Validation
        if (!name || !email || !age || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email already exists
        const existingPatient = await patientModel.findOne({ email });
        if (existingPatient) {
            return res.status(409).json({ message: "Patient with this email already exists" });
        }

        // Validate age
        if (age <= 0 || age > 150) {
            return res.status(400).json({ message: "Age must be between 1 and 150" });
        }

        // Validate gender
        const validGenders = ["MALE", "FEMALE", "OTHER"];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ message: "Invalid gender. Must be MALE, FEMALE, or OTHER" });
        }

        // Create new patient
        const newPatient = new patientModel({
            name,
            email,
            age,
            gender
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        console.error("Error creating patient:", error);
        res.status(500).json({ message: "Error creating patient", error: error.message });
    }
}