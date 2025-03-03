import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// JWT Token Generation
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Set JWT cookie
  res.cookie("jwt", token, cookieOptions);

  return { token, user: { ...user.toObject(), password: undefined } };
};

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            provider: "google",
            providerId: profile.id,
            password: crypto.randomBytes(32).toString("hex"), // Random password for OAuth users
            role: "user",
          });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            firstName: profile.displayName.split(" ")[0],
            lastName: profile.displayName.split(" ")[1] || "",
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            provider: "github",
            providerId: profile.id,
            password: crypto.randomBytes(32).toString("hex"),
            role: "user",
          });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/meta/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            provider: "facebook",
            providerId: profile.id,
            password: crypto.randomBytes(32).toString("hex"),
            role: "user",
          });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// OAuth callback handler
export const handleOAuthCallback = async (req, res) => {
  try {
    const authResponse = createSendToken(req.user, 200, res);

    // Send response that will be handled by the popup window
    res.send(`
      <script>
        window.opener.postMessage({
          status: 'success',
          token: '${authResponse.token}',
          user: ${JSON.stringify(authResponse.user)}
        }, '${process.env.CLIENT_URL}');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send(`
      <script>
        window.opener.postMessage({
          status: 'error',
          message: 'Authentication failed'
        }, '${process.env.CLIENT_URL}');
        window.close();
      </script>
    `);
  }
};

export default {
  handleOAuthCallback,
};
