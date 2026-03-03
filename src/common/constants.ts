export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MESSAGES = {
  USER: {
    CREATED: 'User created successfully',
    RETRIEVED: 'User retrieved successfully',
    RETRIEVED_ALL: 'Users retrieved successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
  },
} as const;
