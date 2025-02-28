// 用户类型定义
export type User = {
  id: string;
  email: string;
  username: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
};

// 登录凭据类型
export type LoginCredentials = {
  email: string;
  password: string;
};

// 注册用户数据类型
export type RegisterUserData = {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
};

// 用户简档类型（公开展示用）
export type UserProfile = Omit<User, 'id'> & {
  joinDate: string;
};

// 认证令牌有效载荷类型
export type TokenPayload = {
  id: string;
  email: string;
  username: string;
  exp: number;
  iat: number;
}; 