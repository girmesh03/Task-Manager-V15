// backend/controllers/authController.js
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Organization, Department, User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../utils/index.js";
import CustomError from "../errorHandler/CustomError.js";
import { checkUserStatus } from "../utils/userStatus.js";

// @desc    Register a new organization and associate department and SuperAdmin user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { organizationData, userData } = req.body;

  // Check uniqueness before transaction
  const [
    existingOrganizationByName,
    existingOrganizationByEmail,
    existingOrganizationByPhone,
    existingUser,
  ] = await Promise.all([
    Organization.findOne({
      name: { $regex: new RegExp(`^${organizationData.name}$`, "i") },
    }).lean(),
    Organization.findOne({
      email: { $regex: new RegExp(`^${organizationData.email}$`, "i") },
    }).lean(),
    Organization.findOne({ phone: organizationData.phone.trim() }).lean(),
    User.findOne({
      email: { $regex: new RegExp(`^${userData.email}$`, "i") },
    }).lean(),
  ]);

  if (existingOrganizationByName) {
    return next(
      new CustomError(
        "Organization name already exists",
        409,
        "ORGANIZATION_NAME_EXISTS_ERROR"
      )
    );
  }

  if (existingOrganizationByEmail) {
    return next(
      new CustomError(
        "Organization email already exists",
        409,
        "ORGANIZATION_EMAIL_EXISTS_ERROR"
      )
    );
  }

  if (existingOrganizationByPhone) {
    return next(
      new CustomError(
        "Organization phone number already exists",
        409,
        "ORGANIZATION_PHONE_EXISTS_ERROR"
      )
    );
  }

  if (existingUser) {
    return next(
      new CustomError(
        "Super Admin email already exists",
        409,
        "USER_EMAIL_EXISTS_ERROR"
      )
    );
  }

  // Can't register with same organization and user email
  if (organizationData.email === userData.email) {
    return next(
      new CustomError(
        "You can't register with the same email as the organization and user",
        400,
        "ORGANIZATION_AND_USER_EMAIL_ERROR"
      )
    );
  }

  // Start a new session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create a new organization
    const organization = new Organization({
      ...organizationData,
    });
    await organization.save({ session });

    // Check department name uniqueness within organization (race condition protection)
    const existingDepartment = await Department.findOne({
      name: userData.departmentName.trim(),
      organization: organization._id,
    }).session(session);

    if (existingDepartment) {
      throw new CustomError(
        "Department name already exists in this organization",
        409,
        "DEPARTMENT_NAME_EXISTS_ERROR"
      );
    }

    // Create a new department - unique per organization enforced by schema index
    const department = new Department({
      name: userData.departmentName,
      description:
        userData.departmentDesc ||
        `${organization.name}, department of ${userData.departmentName}`,
      organization: organization._id,
    });
    await department.save({ session });

    // Create SuperAdmin user
    const adminUser = new User({
      ...userData,
      role: "SuperAdmin",
      organization: organization._id,
      department: department._id,
      isActive: true,
      isVerified: true,
    });
    await adminUser.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Send response
    res.status(201).json({
      success: true,
      message:
        "Organization, department and super admin user created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

//@desc    Authenticate user and set token via cookies
//@route   POST /api/auth/login
//@access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with organization and department details
    const user = await User.findOne({ email })
      .select("+password")
      .populate("organization", "name isActive subscription")
      .populate("department", "name isActive");

    const userStatus = checkUserStatus(user);
    if (userStatus.status) {
      return next(
        new CustomError(userStatus.message, 401, userStatus.errorCode)
      );
    }

    // Verify password
    if (!(await user.comparePassword(password))) {
      return next(
        new CustomError(
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS_ERROR"
        )
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie("access_token", accessToken, getAccessTokenCookieOptions());
    res.cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

//@desc    Logout user and clear cookies
//@route   DELETE /api/auth/logout
//@access  Private(TODO: Required only logged in users to logout)
export const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    // Clear cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
});

//@desc    Get new access token using refresh token
//@route   GET /api/auth/refresh-token
//@access  Private(Private b/c at least one valid refresh token is required)
export const getRefreshToken = asyncHandler(async (req, res, next) => {
  try {
    // Extract refresh token from cookies
    const refreshToken = req.cookies?.refresh_token;

    // Check if refresh token is provided
    if (!refreshToken) {
      return next(
        new CustomError(
          "Refresh token is required",
          401,
          "MISSING_REFRESH_TOKEN_ERROR"
        )
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      // Clear invalid refresh token cookie
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      if (jwtError.name === "TokenExpiredError") {
        return next(
          new CustomError(
            "Refresh token has expired",
            401,
            "REFRESH_TOKEN_EXPIRED_ERROR"
          )
        );
      } else if (jwtError.name === "JsonWebTokenError") {
        return next(
          new CustomError(
            "Invalid refresh token",
            401,
            "INVALID_REFRESH_TOKEN_ERROR"
          )
        );
      } else {
        return next(
          new CustomError(
            "Refresh token verification failed",
            401,
            "REFRESH_TOKEN_VERIFICATION_ERROR"
          )
        );
      }
    }

    // Fetch user data with organization and department details
    const user = await User.findById(decoded.userId)
      .populate("organization", "name isActive subscription")
      .populate("department", "name isActive")
      .select("-password");

    const userStatus = checkUserStatus(user);
    if (userStatus.status) {
      // Clear cookies if user status is not valid
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return next(
        new CustomError(userStatus.message, 401, userStatus.errorCode)
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Set new access token cookie
    res.cookie("access_token", newAccessToken, getAccessTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});
