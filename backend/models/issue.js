const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "Unknown location" },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Working", "Done"],
      default: "Pending",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    category: {
      type: String,
      enum: [
        "Road",
        "Electricity",
        "Water",
        "Garbage",
        "Public Safety",
        "Other",
      ],
      default: "Other",
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reportedAt: {
      type: Date,
      default: Date.now, // automatically sets the date at creation
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);