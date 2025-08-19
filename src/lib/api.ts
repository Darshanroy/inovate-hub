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

export interface ProfileGetResponse {
  profile: Record<string, any>;
  exists: boolean;
}

export interface ProfileUpdateRequest {
  token: string;
  profile: Record<string, any>;
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

  async getProfile(token: string): Promise<ProfileGetResponse> {
    return this.request<ProfileGetResponse>('/auth/profile/get', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/profile/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Hackathons
  async listHackathons(): Promise<{ hackathons: any[] }> {
    return this.request<{ hackathons: any[] }>('/hackathons/list');
  }

  async getHackathon(id: string): Promise<any> {
    return this.request<any>(`/hackathons/get/${id}`);
  }

  async createHackathon(token: string, hackathon: any): Promise<{ id: string; message: string }> {
    return this.request<{ id: string; message: string }>(`/hackathons/create`, {
      method: 'POST',
      body: JSON.stringify({ token, hackathon }),
    });
  }

  async updateHackathon(token: string, id: string, hackathon: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/update/${id}`, {
      method: 'POST',
      body: JSON.stringify({ token, hackathon }),
    });
  }

  async deleteHackathon(token: string, id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/delete/${id}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async registerForHackathon(token: string, id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/register/${id}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async myRegistrations(token: string): Promise<{ hackathons: any[] }> {
    return this.request<{ hackathons: any[] }>(`/hackathons/my-registrations`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
