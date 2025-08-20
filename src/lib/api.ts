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

export interface Team {
  id: string;
  name: string;
  description: string;
  code: string;
  leader_id: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  max_members: number;
  created_at: string;
}

export interface TeamRequest {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  motivation: string;
  portfolio_link: string;
  looking_for_team: boolean;
  team_code: string;
  registration_date: string;
  team?: {
    team_id: string;
    team_name: string;
    team_code: string;
  };
}

export interface Submission {
  id: string;
  hackathon_id: string;
  team_id: string;
  team_name: string;
  project_title: string;
  project_description: string;
  tech_stack: string[];
  github_link?: string;
  video_link?: string;
  files: SubmissionFile[];
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  score?: number;
  feedback?: string;
  submitted_at: string;
  updated_at: string;
  created_at: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface CreateSubmissionRequest {
  token: string;
  hackathon_id: string;
  submission: {
    project_title: string;
    project_description: string;
    tech_stack: string[];
    github_link?: string;
    video_link?: string;
  };
}

export interface UpdateSubmissionRequest {
  token: string;
  submission_id: string;
  updates: {
    project_title?: string;
    project_description?: string;
    tech_stack?: string[];
    github_link?: string;
    video_link?: string;
  };
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

  async registerForHackathon(
    token: string,
    id: string,
    details?: {
      motivation?: string;
      hasTeam?: boolean;
      teamCode?: string;
      portfolio?: string;
      fullName?: string;
      role?: string;
      skills?: string[];
      experienceLevel?: string;
      github?: string;
      linkedin?: string;
      resumeLink?: string;
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/register/${id}`, {
      method: 'POST',
      body: JSON.stringify({ token, details }),
    });
  }

  async myRegistrations(token: string): Promise<{ hackathons: any[] }> {
    return this.request<{ hackathons: any[] }>(`/hackathons/my-registrations`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Team Management
  async createTeam(token: string, hackathonId: string, team: { name: string; description?: string }): Promise<{ message: string; team_id: string; code: string }> {
    return this.request<{ message: string; team_id: string; code: string }>(`/hackathons/teams/create/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, team }),
    });
  }

  async listTeams(hackathonId: string): Promise<{ teams: Team[] }> {
    return this.request<{ teams: Team[] }>(`/hackathons/teams/list/${hackathonId}`);
  }

  async joinTeam(token: string, hackathonId: string, teamCode: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/teams/join/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, team_code: teamCode }),
    });
  }

  async requestJoinTeam(token: string, hackathonId: string, teamId: string, message?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/teams/request/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, team_id: teamId, message }),
    });
  }

  async getTeamRequests(token: string, hackathonId: string): Promise<{ requests: TeamRequest[] }> {
    return this.request<{ requests: TeamRequest[] }>(`/hackathons/teams/requests/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async respondToTeamRequest(token: string, hackathonId: string, requestId: string, response: 'accept' | 'reject'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/teams/requests/respond`, {
      method: 'POST',
      body: JSON.stringify({ token, request_id: requestId, action: response === 'accept' ? 'approve' : 'reject' }),
    });
  }

  // Team Messages and Updates
  async getTeamMessages(token: string, hackathonId: string): Promise<{ messages: any[] }> {
    return this.request<{ messages: any[] }>(`/hackathons/teams/messages/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async sendTeamMessage(token: string, hackathonId: string, message: string): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(`/hackathons/teams/messages/send/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, message }),
    });
  }

  async updateTeam(token: string, hackathonId: string, updates: { description?: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/teams/update/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, updates }),
    });
  }

  async getMyTeam(token: string, hackathonId: string): Promise<{ team: any }> {
    return this.request<{ team: any }>(`/hackathons/teams/my-team/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async removeTeamMember(token: string, hackathonId: string, memberId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/teams/remove-member/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, member_id: memberId }),
    });
  }

  // Organizer Dashboard
  async getOrganizerHackathons(token: string): Promise<{ hackathons: any[] }> {
    return this.request<{ hackathons: any[] }>(`/hackathons/organizer/hackathons`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getHackathonParticipants(token: string, hackathonId: string): Promise<{ participants: Participant[] }> {
    return this.request<{ participants: Participant[] }>(`/hackathons/organizer/participants/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async deleteHackathon(token: string, hackathonId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/organizer/delete/${hackathonId}`, {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    });
  }

  async updateHackathon(token: string, hackathonId: string, updates: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/organizer/update/${hackathonId}`, {
      method: 'PUT',
      body: JSON.stringify({ token, updates }),
    });
  }

  async publishHackathon(token: string, hackathonId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/organizer/publish/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async saveDraft(token: string, hackathonId: string, data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/organizer/draft/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token, data }),
    });
  }

  // Submission Management
  async createSubmission(data: CreateSubmissionRequest): Promise<{ message: string; submission_id: string }> {
    return this.request<{ message: string; submission_id: string }>(`/hackathons/submissions/create/${data.hackathon_id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmission(data: UpdateSubmissionRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/submissions/update/${data.submission_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMySubmission(token: string, hackathonId: string): Promise<{ submission: Submission | null }> {
    return this.request<{ submission: Submission | null }>(`/hackathons/submissions/my/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getSubmission(submissionId: string): Promise<{ submission: Submission }> {
    return this.request<{ submission: Submission }>(`/hackathons/submissions/get/${submissionId}`);
  }

  async listHackathonSubmissions(token: string, hackathonId: string): Promise<{ submissions: Submission[] }> {
    return this.request<{ submissions: Submission[] }>(`/hackathons/submissions/list/${hackathonId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async uploadSubmissionFile(token: string, submissionId: string, file: File): Promise<{ file: SubmissionFile }> {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('file', file);

    return this.request<{ file: SubmissionFile }>(`/hackathons/submissions/upload/${submissionId}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  async deleteSubmissionFile(token: string, submissionId: string, fileId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/submissions/files/delete/${submissionId}`, {
      method: 'DELETE',
      body: JSON.stringify({ token, file_id: fileId }),
    });
  }

  async submitProject(token: string, submissionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/submissions/submit/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async saveSubmissionDraft(token: string, submissionId: string, data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/submissions/draft/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify({ token, data }),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
