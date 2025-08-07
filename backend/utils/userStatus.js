// backend/utils/userStatus.js

export const checkUserStatus = (user) => {
  if (!user) {
    return {
      status: true,
      message: "User not found",
      errorCode: "USER_NOT_FOUND_ERROR",
    };
  }

  if (!user.isVerified) {
    return {
      status: true,
      message: "User account is not verified",
      errorCode: "USER_NOT_VERIFIED_ERROR",
    };
  }

  if (!user.isActive) {
    return {
      status: true,
      message: "User account is deactivated",
      errorCode: "USER_DEACTIVATED_ERROR",
    };
  }

  if (!user.organization || !user.organization.isActive) {
    return {
      status: true,
      message: "Organization account is deactivated",
      errorCode: "ORGANIZATION_DEACTIVATED_ERROR",
    };
  }

  if (user.organization.subscription.status !== "active") {
    return {
      status: true,
      message: "Organization subscription is not active",
      errorCode: "SUBSCRIPTION_INACTIVE_ERROR",
    };
  }

  if (!user.department || !user.department.isActive) {
    return {
      status: true,
      message: "Department is deactivated",
      errorCode: "DEPARTMENT_DEACTIVATED_ERROR",
    };
  }

  return { status: false };
};
