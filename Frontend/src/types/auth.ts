export type User = {
  id: number;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
