export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  role: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  age: number;
  height_cm: number;
  sex: string;
  medical_history: MedicalHistory;
  family_history: FamilyHistory;
  lifestyle_factors: LifestyleFactors;
}

export interface MedicalHistory {
  chronic_conditions: string[];
  past_surgeries: string[];
  current_medications: string[];
  known_allergies: string[];
}

export interface FamilyHistory {
  heart_disease: boolean;
  diabetes: boolean;
  cancer: boolean;
  other_hereditary_conditions: string[];
}

export interface LifestyleFactors {
  smoking_status: string;
  alcohol_consumption: string;
  exercise_habits: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  age: number;
  height_cm: number;
  sex: string;
  body_weight_kg?: number;
  medical_history: MedicalHistory;
  family_history: FamilyHistory;
  lifestyle_factors: LifestyleFactors;
}

export interface DailyCheckIn {
  body_weight_kg: number;
  illness_symptoms: IllnessReport;
  energy_level: number;
  muscle_soreness: number;
  mood_state: number;
  location_coordinates?: Coordinates;
  additional_notes?: string;
}

export interface IllnessReport {
  present: boolean;
  description?: string;
  duration_days?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MergedDailyRecord {
  _id: string;
  user_id: string;
  date: string;
  checkin_data: DailyCheckIn;
  device_data: WeeklyMetric;
}

export interface WeeklyMetric {
  date: string;
  heart_rate: HeartRate;
  hrv: HRV;
  sleep: Sleep;
  activity: PhysicalActivity;
  spo2: SpO2;
  skin_temp: SkinTemperature;
}

export interface HeartRate {
  resting_hr: number;
  average_weekly_hr: number;
}

export interface HRV {
  average_hrv: number;
}

export interface Sleep {
  sleep_duration_hours: number;
}

export interface PhysicalActivity {
  steps: number;
  calories_burned: number;
}

export interface SpO2 {
  average_spo2: number;
}

export interface SkinTemperature {
  deviation_celsius: number;
}

export interface HealthSummary {
  total_checkins: number;
  date_range: {
    earliest?: string;
    latest?: string;
    first?: string;
    last?: string;
  };
  average_metrics: {
    energy_level?: number;
    mood_state?: number;
    resting_heart_rate?: number;
    sleep_hours?: number;
    daily_steps?: number;
    // Legacy fields for backwards compatibility
    resting_hr?: number;
    sleep_duration_hours?: number;
    steps?: number;
    muscle_soreness?: number;
  };
  latest_weight_kg?: number;
  illness_count: number;
}

export interface AgentAnalysisResponse {
  patient_id: string;
  analysis_text: string;
}

export interface RecommendationsResponse {
  patient_id: string;
  evaluation: string;
  recommendations: string;
}

export interface PatientListItem {
  _id: string;
  email: string;
  age: number;
  sex: string;
}

export interface DashboardStats {
  total_patients: number;
  active_patients_last_week: number;
  total_checkins: number;
}

