const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.get("/users", authController.users);
router.delete("/delete", authController.deleteAllUsers);
router.get("/logout", authController.logout);
// Protected route example
router.get("/me", protect, authController.users);

// Example of protected route with role restriction
// router.delete('/users/:id', protect, restrictTo('admin'), authController.deleteUser);

module.exports = router;
