export type Role = 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}

export interface RegisterInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
