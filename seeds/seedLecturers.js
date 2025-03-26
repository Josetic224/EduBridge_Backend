require('dotenv').config()
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");


 const MONGO_URI="mongodb+srv://josephochiagha112:pyY8sAr8JuaFdiaX@educluster.so9af.mongodb.net/EduClusterDB?retryWrites=true&w=majority&appName=EduCluster"

// console.log("✅ MONGO_URI:", MONGO_URI); // Should print the actual Mongo URI

// if (!MONGO_URI) {
//   console.error("❌ Missing MONGODB_URL in your .env file");
//   process.exit(1);
// }

const lecturers = [
  {
    userName: "Dr. Maths",
    email: "maths@edubridge.com",
    password: "Password123!",
    role: "LECTURER",
    subjects: ["Mathematics"],
    university: "University of Lagos",
    country: "Nigeria",
  },
  {
    userName: "Ms. Frontend",
    email: "frontend@edubridge.com",
    password: "Password123!",
    role: "LECTURER",
    subjects: ["Frontend Development"],
    university: "University of Ibadan",
    country: "Nigeria",
  },
  {
    userName: "Prof. Algo",
    email: "algo@edubridge.com",
    password: "Password123!",
    role: "LECTURER",
    subjects: ["Algorithms"],
    university: "Covenant University",
    country: "Nigeria",
  },
];

async function seedLecturers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Optionally clear old test lecturers
    await User.deleteMany({ role: "LECTURER" });

    // Hash passwords
    const lecturerData = await Promise.all(
      lecturers.map(async (lecturer) => {
        const hashedPassword = await bcrypt.hash(lecturer.password, 10);
        return { ...lecturer, password: hashedPassword };
      })
    );

    const inserted = await User.insertMany(lecturerData);
    console.log(`✅ Seeded ${inserted.length} lecturers.`);
    inserted.forEach((user) => {
      console.log(`📌 ${user.userName}: ${user._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
}

seedLecturers();
