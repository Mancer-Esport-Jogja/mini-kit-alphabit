export interface User {
  id: string;
  fid: string;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  primaryEthAddress: string | null;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}
