const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AssignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 100,
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
    submissionType: {
      type: String,
      enum: ["FILE", "TEXT", "BOTH"],
      default: "BOTH",
    },
    allowLateSubmissions: {
      type: Boolean,
      default: false,
    },
    lateSubmissionDeadline: {
      type: Date,
    },
    lateSubmissionPenalty: {
      type: Number, // Percentage deduction
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("Assignment", AssignmentSchema);