const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const SubmissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
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
      enum: ["SUBMITTED", "LATE", "GRADED", "RETURNED"],
      default: "SUBMITTED",
    },
    grade: {
      points: {
        type: Number,
      },
      feedback: {
        type: String,
      },
      gradedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      gradedAt: {
        type: Date,
      },
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure a student can only submit once per assignment
// (unless multiple attempts are tracked via the attempts field)
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = model("Submission", SubmissionSchema);