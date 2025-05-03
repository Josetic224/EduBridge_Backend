const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
const uploadToCloudinary = (filePath, folder = "general") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        // Remove the file from local storage after upload
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    format: async (req, file) => "png",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Configure Cloudinary storage for assignment attachments
const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assignment_attachments",
    format: async (req, file) => path.extname(file.originalname).substring(1),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Configure Cloudinary storage for submission attachments
const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "submission_attachments",
    format: async (req, file) => path.extname(file.originalname).substring(1),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Configure Cloudinary storage for course materials
const courseMaterialStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "course_materials",
    format: async (req, file) => path.extname(file.originalname).substring(1),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Create multer upload instances
const uploadProfilePicture = multer({ storage: profilePictureStorage });
const uploadAssignmentFiles = multer({ storage: assignmentStorage });
const uploadSubmissionFiles = multer({ storage: submissionStorage });
const uploadCourseMaterial = multer({ storage: courseMaterialStorage });

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadProfilePicture,
  uploadAssignmentFiles,
  uploadSubmissionFiles,
  uploadCourseMaterial,
};
