const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    logo: {
      type: String, // Cloudinary URL
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TRIAL"],
      default: "TRIAL",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
