// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { checkUserStatus } from "../utils/index.js";
import CustomError from "../errorHandler/CustomError.js";

// Middleware to verify JWT token
export const verifyJWT = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.access_token;

    if (!token) {
      return next(
        new CustomError(
          "Access token is required",
          401,
          "AUTHENTICATION_TOKEN_ERROR"
        )
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return next(
          new CustomError(
            "Access token has expired",
            401,
            "TOKEN_EXPIRED_ERROR"
          )
        );
      } else if (jwtError.name === "JsonWebTokenError") {
        return next(
          new CustomError("Invalid access token", 401, "INVALID_TOKEN_ERROR")
        );
      } else {
        return next(
          new CustomError(
            "Token verification failed",
            401,
            "TOKEN_VERIFICATION_FAILED_ERROR"
          )
        );
      }
    }

    // Fetch user data with organization and department details
    const user = await User.findById(decoded.userId)
      .populate("organization", "name subscription isActive")
      .populate("department", "name isActive");

    // Check user status
    const userStatus = checkUserStatus(user);
    if (userStatus.status) {
      return next(
        new CustomError(userStatus.message, 401, userStatus.errorCode)
      );
    }

    // Attach user data to request
    req.user = user;
    next();
  } catch (error) {
    return next(
      new CustomError(
        `Internal server error during authentication: ${error.message}`,
        500,
        "AUTHENTICATION_ERROR"
      )
    );
  }
};
