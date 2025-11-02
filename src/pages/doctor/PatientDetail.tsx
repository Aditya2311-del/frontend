import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { FormattedAnalysis } from '../../components/FormattedAnalysis';
import { doctorAPI } from '../../services/api';
import type { UserProfile, MergedDailyRecord, HealthSummary } from '../../types';
import { ArrowLeft, User, FileText, Brain, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<MergedDailyRecord[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string>('');
  const [recommendations, setRecommendations] = useState<{ evaluation: string; recommendations: string } | null>(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientId) return;

    try {
      const [profileData, checkInsData, summaryData] = await Promise.all([
        doctorAPI.getPatientProfile(patientId),
        doctorAPI.getPatientCheckIns(patientId),
        doctorAPI.getPatientSummary(patientId).catch(() => null),
      ]);
      setProfile(profileData);
      setCheckIns(checkInsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!patientId) return;
    setAnalysis('');
    try {
      const data = await doctorAPI.analyzePatient(patientId);
      setAnalysis(data.analysis_text);
      setRecommendations(null);
    } catch (error) {
      setAnalysis('Failed to generate analysis');
    }
  };

  const handleGetRecommendations = async () => {
    if (!patientId) return;
    setRecommendations(null);
    try {
      const data = await doctorAPI.getPatientRecommendations(patientId);
      setRecommendations({ evaluation: data.evaluation, recommendations: data.recommendations });
      setAnalysis('');
    } catch (error) {
      setRecommendations({ evaluation: 'Error', recommendations: 'Failed to generate recommendations' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Patient not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.email}</h1>
                <p className="text-gray-600">
                  {profile.age} years old • {profile.sex} • {profile.height_cm} cm
                  {profile.body_weight_kg && ` • ${profile.body_weight_kg} kg`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Analyze
              </button>
              <button
                onClick={handleGetRecommendations}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Recommendations
              </button>
            </div>
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_checkins}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Energy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.average_metrics.energy_level?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Mood</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.average_metrics.mood_state?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Illness Count</p>
                <p className="text-2xl font-bold text-gray-900">{summary.illness_count}</p>
              </div>
            </div>
          )}
        </div>

        {analysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Health Analysis
            </h3>
            <div className="text-sm">
              <FormattedAnalysis text={analysis} />
            </div>
          </div>
        )}

        {recommendations && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Recommendations
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Evaluation</h4>
                <div className="text-sm">
                  <FormattedAnalysis text={recommendations.evaluation} />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                <div className="text-sm">
                  <FormattedAnalysis text={recommendations.recommendations} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Check-in History
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {checkIns.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No check-ins yet</div>
            ) : (
              checkIns.map((checkin) => (
                <div key={checkin._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(checkin.date), 'MMMM d, yyyy')}
                      </p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        <span>Energy: {checkin.checkin_data.energy_level}/10</span>
                        <span>Mood: {checkin.checkin_data.mood_state}/10</span>
                        <span>Weight: {checkin.checkin_data.body_weight_kg} kg</span>
                      </div>
                      {checkin.checkin_data.additional_notes && (
                        <p className="mt-2 text-sm text-gray-600">{checkin.checkin_data.additional_notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>HR: {checkin.device_data.heart_rate.resting_hr} bpm</div>
                      <div>Sleep: {checkin.device_data.sleep.sleep_duration_hours.toFixed(1)}h</div>
                      <div>Steps: {checkin.device_data.activity.steps}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

