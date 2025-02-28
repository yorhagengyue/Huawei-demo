// User type definition
export type User = {
  id: string;
  email: string;
  username: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
};

// Login credentials type
export type LoginCredentials = {
  email: string;
  password: string;
};

// Registration user data type
export type RegisterUserData = {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
};

// User profile type (for public display)
export type UserProfile = Omit<User, 'id'> & {
  joinDate: string;
};

// Authentication token payload type
export type TokenPayload = {
  id: string;
  email: string;
  username: string;
  exp: number;
  iat: number;
}; 