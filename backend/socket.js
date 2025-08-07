// backend/socket.js
import jwt from "jsonwebtoken";
import { User } from "./models/index.js";
import { Server as SocketIOServer } from "socket.io";
import { setIO, joinDepartmentRooms } from "./utils/index.js";
import CustomError from "./errorHandler/CustomError.js";
import { checkUserStatus } from "./utils/userStatus.js";

const extractToken = (cookieHeader) => {
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("access_token="));
  return tokenCookie ? tokenCookie.split("=")[1].trim() : null;
};

const socketAuth = async (socket, next) => {
  try {
    const token = extractToken(socket.handshake.headers.cookie);
    if (!token) {
      return next(
        new CustomError(
          "Access token is required",
          401,
          "UNAUTHORIZED_TOKEN_MISSING_ERROR"
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
            "Socket Token verification failed",
            401,
            "TOKEN_VERIFICATION_FAILED_ERROR"
          )
        );
      }
    }

    // Fetch user data with organization and department details
    const user = await User.findById(decoded.userId)
      .populate("organization", "name subscription.status isActive")
      .populate("department", "name isActive");

    const userStatus = checkUserStatus(user);
    if (userStatus.status) {
      return next(
        new CustomError(userStatus.message, 401, userStatus.errorCode)
      );
    }

    // Attach user data to socket
    socket.user = user;
    next();
  } catch (error) {
    return next(
      new CustomError(
        `Internal server error during socket authentication: ${error.message}`,
        500,
        "SOCKET_AUTHENTICATION_ERROR"
      )
    );
  }
};

const setupSocketIO = (server, corsSocketOptions) => {
  try {
    const io = new SocketIOServer(server, {
      cors: corsSocketOptions,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    setIO(io);
    io.use(socketAuth);

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id} | User: ${socket.user._id}`);

      // Non-blocking room join
      setTimeout(() => {
        joinDepartmentRooms(socket).catch((err) =>
          console.error(`Room join error: ${err.message}`)
        );
      }, 0);

      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected (${reason}): ${socket.id}`);
      });

      socket.on("error", (err) => {
        console.error(`Socket error: ${socket.id} | ${err.message}`);
      });
    });

    io.engine.on("connection_error", (err) => {
      console.error(`Socket.IO connection error: ${err.message}`);
    });

    return io;
  } catch (err) {
    console.error(`Socket.IO setup failed: ${err.message}`);
    throw err;
  }
};

export default setupSocketIO;
