const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
    },
    waiterRequested: {
      type: Boolean,
      default: false,
    },
    billRequested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
