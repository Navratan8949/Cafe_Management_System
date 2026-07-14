const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    // If you want _id to be String (e.g. for UUID/nanoid), uncomment below. Otherwise, let MongoDB handle it.
    // _id: String,
    hotelId: {
        type: mongoose.Schema.Types.ObjectId, // Recommended to use ObjectId for references
        ref: "Hotel",
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["SUPERADMIN", "MANAGER"],
        required: true,
        default: "MANAGER"
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Password verification method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// JWT Token generation method
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            hotelId: this.hotelId,
        },
        process.env.ACCESS_TOKEN_SECRET || "fallback_secret",
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
        }
    );
};

module.exports = mongoose.model("User", userSchema);