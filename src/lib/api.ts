const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export interface AuthResponse {
  message: string;
  uid?: string;
  token?: string;
  user_type?: string;
  email?: string;
  name?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  user_type?: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ExchangeIdTokenRequest {
  idToken: string;
  user_type?: string;
}

export interface UserInfo {
  valid: boolean;
  user_id: string;
  email: string;
  user_type: string;
  name: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyToken(data: VerifyTokenRequest): Promise<UserInfo> {
    return this.request<UserInfo>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exchangeIdToken(data: ExchangeIdTokenRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/exchange', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
