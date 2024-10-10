const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, "Name should be more than 3 characters"],
    maxlength: [50, "Name should be less than 50 characters"],
    required: [true, "username is a required field"],
    validate: {
      validator: (value) => /^[a-zA-Z\s]+$/.test(value),
      message: "Name should contain only letters and spaces",
    },
  },
  email: {
    type: String,
    required: [true, "email is a required field"],
    validate: {
      validator: (value) => {
        validator.isEmail(value);
      },
      message: "please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "password is a required field"],
    validate: {
      validator: function (value) {
        const errors = [];
        if (!/[A-Z]/.test(value)) {
          errors.push("Password must contain atleast one uppercase letter");
        }
        if (!/[a-z]/.test(value)) {
          errors.push("Password must contain atlease one lowercase letter");
        }
        if (!/[0-9]/.test(value)) {
          errors.push("Password must contain atleast one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.push("Password must contain atleast one special character");
        }
        if (errors.length > 0) {
          throw new Error(errors.join(", "));
        }
        return true;
      },
      message: (props) => props.reason.message,
    },
  },
  picture: {
    type: String,
    default:
      "https://imgs.search.brave.com/cUa5rWZ_Q7oY7mCXVF1VRZdDbtiWpBiesUzEgph41PI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA4LzAzLzMxLzQ1/LzM2MF9GXzgwMzMx/NDU5M19FNm01eHJW/Zmtlc1FWUnh1Vjhp/WnBldHdLZ05vZUZj/by5qcGc",
  },
  role: {
    type: String,
    enum: ["ADMIN", "EMPLOYEE"],
    default: "EMPLOYEE",
  },
  refreshToken: {
    type: String,
  },
});

// middleware for pre hashing password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// middleware to check password
adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// middleware to generate access token
adminSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      picture: this.picture,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

// middleware to generate refresh token
adminSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
