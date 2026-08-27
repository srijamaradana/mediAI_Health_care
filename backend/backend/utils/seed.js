// Seeds the database with an admin user, a demo doctor, and a demo patient.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const run = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ["admin@mediai.com", "doctor@mediai.com", "patient@mediai.com"] } });

  const admin = await User.create({
    name: "Admin User",
    email: "admin@mediai.com",
    password: "Admin@12345",
    role: "admin",
  });

  const doctorUser = await User.create({
    name: "Dr. Sarah Johnson",
    email: "doctor@mediai.com",
    password: "Doctor@12345",
    role: "doctor",
    phone: "555-0101",
  });

  await Doctor.create({
    user: doctorUser._id,
    specialization: "Cardiology",
    qualifications: ["MBBS", "MD Cardiology"],
    experienceYears: 12,
    licenseNumber: "LIC-CARD-001",
    consultationFee: 75,
    bio: "Board-certified cardiologist with 12 years of clinical experience.",
    availability: [
      { day: "Mon", startTime: "09:00", endTime: "13:00" },
      { day: "Wed", startTime: "09:00", endTime: "13:00" },
      { day: "Fri", startTime: "14:00", endTime: "18:00" },
    ],
    isApproved: true,
  });

  await User.create({
    name: "John Patient",
    email: "patient@mediai.com",
    password: "Patient@12345",
    role: "patient",
    phone: "555-0102",
    bloodGroup: "O+",
  });

  console.log("Seed complete:");
  console.log("  Admin:   admin@mediai.com / Admin@12345");
  console.log("  Doctor:  doctor@mediai.com / Doctor@12345");
  console.log("  Patient: patient@mediai.com / Patient@12345");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
