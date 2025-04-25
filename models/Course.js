const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "UPCOMING", "COMPLETED", "ARCHIVED"],
      default: "UPCOMING",
    },
    materials: [{
      title: String,
      description: String,
      fileUrl: String,
      fileType: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    syllabus: {
      type: String,
    },
    enrollmentKey: {
      type: String,
    },
    isEnrollmentOpen: {
      type: Boolean,
      default: true,
    },
    maxEnrollment: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = model("Course", CourseSchema);