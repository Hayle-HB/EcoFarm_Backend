const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    // Create new user with first and last name
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate token
    const token = signToken(user._id);

    // Set cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Create a sanitized user object for response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    // Send success response
    res.status(201).json({
      status: "success",
      message: "Registration successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      status: "error",
      message: error.message || "An error occurred during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    // 2. Check if user exists & password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect email or password",
      });
    }

    // 3. Generate JWT token
    const token = signToken(user._id);

    // 4. Set cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // 5. Remove sensitive data
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    // 6. Send success response
    res.status(200).json({
      status: "success",
      token,
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error) {
    // 7. Error handling
    res.status(400).json({
      status: "error",
      message: error.message || "An error occurred during login",
    });
  }
};

exports.deleteAllUsers = async (req, res) => {
  await User.deleteMany();
  res.status(200).json({
    status: "success",
    message: "All users deleted",
  });
};

exports.logout = async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

exports.users = async (req, res) => {
  res.status(200).json({
    name: "John",
    email: "john@gmail.com",
    password: "123456",
  });
};

// Add getMe endpoint
exports.getMe = async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};
