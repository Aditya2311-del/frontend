import axios from 'axios';
import { API_BASE_URL } from '../config';
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  UserProfile,
  DailyCheckIn,
  MergedDailyRecord,
  HealthSummary,
  AgentAnalysisResponse,
  RecommendationsResponse,
  PatientListItem,
  DashboardStats,
  WeeklyMetric,
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  signup: async (data: SignUpRequest) => {
    const response = await api.post('/api/v1/auth/signup', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

// Patient API
export const patientAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/api/v1/user/profile');
    return response.data;
  },

  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/api/v1/user/profile', profile);
    return response.data;
  },

  submitCheckIn: async (checkin: DailyCheckIn): Promise<MergedDailyRecord> => {
    const response = await api.post<MergedDailyRecord>('/api/v1/user/checkin', checkin);
    return response.data;
  },

  getCheckIns: async (): Promise<MergedDailyRecord[]> => {
    const response = await api.get<MergedDailyRecord[]>('/api/v1/user/checkins');
    return response.data;
  },

  getSummary: async (): Promise<HealthSummary | null> => {
    try {
      const response = await api.get<HealthSummary>('/api/v1/user/summary');
      return response.data;
    } catch (error: any) {
      // Return null for 404 (no check-ins yet) or other errors
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getLatestInsight: async () => {
    try {
      const response = await api.get('/api/v1/user/latest-insight');
      return response.data;
    } catch (error: any) {
      // Return null for 404 (no check-ins yet) - this is expected for new users
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  analyzeHealth: async (): Promise<AgentAnalysisResponse> => {
    const response = await api.get<AgentAnalysisResponse>('/api/v1/user/analyze');
    return response.data;
  },

  getRecommendations: async (): Promise<RecommendationsResponse> => {
    const response = await api.get<RecommendationsResponse>('/api/v1/user/recommend');
    return response.data;
  },

  getDiseaseSpecific: async () => {
    const response = await api.get('/api/v1/user/disease-specific');
    return response.data;
  },

  deleteCheckIn: async (recordId: string) => {
    const response = await api.delete(`/api/v1/user/checkins/${recordId}`);
    return response.data;
  },

  getWeeklySummary: async (): Promise<WeeklyMetric> => {
    const response = await api.get<WeeklyMetric>('/api/v1/user/mock/weekly-summary');
    return response.data;
  },
};

// Doctor API
export const doctorAPI = {
  getPatients: async (skip = 0, limit = 50) => {
    const response = await api.get<{ patients: PatientListItem[]; total: number }>(
      `/api/v1/doctor/patients?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  searchPatients: async (email?: string, ageMin?: number, ageMax?: number) => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (ageMin) params.append('age_min', ageMin.toString());
    if (ageMax) params.append('age_max', ageMax.toString());
    
    const response = await api.get<{ patients: PatientListItem[]; count: number }>(
      `/api/v1/doctor/patients/search?${params.toString()}`
    );
    return response.data;
  },

  getPatientProfile: async (patientId: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/api/v1/doctor/patients/${patientId}/profile`);
    return response.data;
  },

  getPatientCheckIns: async (patientId: string): Promise<MergedDailyRecord[]> => {
    const response = await api.get<MergedDailyRecord[]>(
      `/api/v1/doctor/patients/${patientId}/checkins`
    );
    return response.data;
  },

  getPatientSummary: async (patientId: string): Promise<HealthSummary> => {
    const response = await api.get<HealthSummary>(
      `/api/v1/doctor/patients/${patientId}/summary`
    );
    return response.data;
  },

  analyzePatient: async (patientId: string): Promise<AgentAnalysisResponse> => {
    const response = await api.get<AgentAnalysisResponse>(
      `/api/v1/doctor/patients/${patientId}/analyze`
    );
    return response.data;
  },

  getPatientRecommendations: async (patientId: string): Promise<RecommendationsResponse> => {
    const response = await api.get<RecommendationsResponse>(
      `/api/v1/doctor/patients/${patientId}/recommend`
    );
    return response.data;
  },

  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/v1/doctor/dashboard');
    return response.data;
  },

  getPatientTimeline: async (patientId: string, days = 30) => {
    const response = await api.get(
      `/api/v1/doctor/patients/${patientId}/timeline?days=${days}`
    );
    return response.data;
  },
};

export default api;

