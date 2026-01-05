import { apiFetch, setToken, setUser, removeToken, removeUser, getUser, getToken } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: any;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  employeeId?: string;
  phone?: string;
  role?: string;
  department?: string;
  branch?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  },

  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login';
  },

  register: (data: RegisterRequest) => 
    apiFetch<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => getUser(),
  
  isAuthenticated: () => !!getToken(),
  
  getToken: () => getToken(),
};
