export const DEFAULT_USERS_PAGE = 1;
export const DEFAULT_USERS_LIMIT = 10;
export const MAX_USERS_LIMIT = 50;

export const USER_SORT_FIELDS = ["fullName", "createdAt", "updatedAt"] as const;

// Never leave the server, regardless of what the client projects or sorts on
export const USER_PRIVATE_FIELDS = ["password", "otp", "otpExpiresAt"] as const;
