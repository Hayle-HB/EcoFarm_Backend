import express from "express";
import passport from "passport";
import { handleOAuthCallback } from "../controllers/outhControllers.js";

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  handleOAuthCallback
);

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  handleOAuthCallback
);

// Meta (Facebook) OAuth routes
router.get("/meta", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/meta/callback",
  passport.authenticate("facebook", { session: false }),
  handleOAuthCallback
);

export default router;
