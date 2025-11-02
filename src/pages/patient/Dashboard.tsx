import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { FormattedAnalysis } from '../../components/FormattedAnalysis';
import { patientAPI } from '../../services/api';
import type { HealthSummary, MergedDailyRecord, AgentAnalysisResponse, RecommendationsResponse } from '../../types';
import { Activity, Heart, Moon, TrendingUp, AlertCircle, CheckCircle, Stethoscope, Loader, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const PatientDashboard = () => {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<MergedDailyRecord[]>([]);
  const [analysis, setAnalysis] = useState<AgentAnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Check for refresh flag from check-in submission
  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem('refreshDashboard') === 'true';
    if (shouldRefresh) {
      sessionStorage.removeItem('refreshDashboard');
      loadCheckInsAndInsights();
    } else {
      // Initial load - only summary, no check-ins, no insights
      loadSummaryOnly();
    }
  }, []);

  const loadSummaryOnly = async () => {
    try {
      const summaryData = await patientAPI.getSummary().catch(() => null);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckInsAndInsights = async () => {
    try {
      setLoading(true);
      // Load summary, check-ins, and insights only after check-in submission
      const [summaryData, checkInsData] = await Promise.all([
        patientAPI.getSummary().catch(() => null),
        patientAPI.getCheckIns().catch(() => []),
      ]);
      setSummary(summaryData);
      setRecentCheckIns(checkInsData.slice(0, 5));
      
      // Load insights sequentially (analyze first, then recommend)
      if (checkInsData.length > 0) {
        await loadHealthInsights();
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse status from analysis response
  const parseAnalysisStatus = (analysisText: string) => {
    // Parse the STATUS from the response (format: **STATUS: [NORMAL / CONSULT RECOMMENDED]**)
    const statusMatch = analysisText.match(/\*\*STATUS:\s*\[([^\]]+)\]\*\*/i);
    const status = statusMatch ? statusMatch[1].trim() : null;
    const isConsultRecommended = status && status.toUpperCase().includes('CONSULT');
    return { status, isConsultRecommended };
  };

  const loadHealthInsights = async () => {
    setLoadingInsights(true);
    setAnalysis(null);
    setRecommendations(null);
    
    try {
      // Step 1: Load analysis first and display it
      console.log('🔄 Fetching analysis...');
      const analysisData = await patientAPI.analyzeHealth().catch(() => null);
      
      if (analysisData) {
        console.log('✅ Analysis Response:', analysisData);
        console.log('📝 Analysis Text:', analysisData.analysis_text);
        const { status, isConsultRecommended } = parseAnalysisStatus(analysisData.analysis_text);
        console.log('🏥 Parsed Status:', status, '| Consult Recommended:', isConsultRecommended);
        setAnalysis(analysisData);
      }
      
      // Step 2: Then load recommendations (sequential, not parallel)
      console.log('🔄 Fetching recommendations...');
      const recommendationsData = await patientAPI.getRecommendations().catch(() => null);
      
      if (recommendationsData) {
        console.log('✅ Recommendations Response:', recommendationsData);
        console.log('📝 Evaluation:', recommendationsData.evaluation);
        console.log('📝 Recommendations:', recommendationsData.recommendations);
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('Failed to load health insights:', error);
    } finally {
      setLoadingInsights(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/patient/checkin"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            New Check-in
          </Link>
        </div>

        {summary && summary.total_checkins > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">{summary.total_checkins}</span>
              </div>
              <p className="text-sm text-gray-600">Total Check-ins</p>
            </div>

            {(summary.average_metrics.resting_heart_rate !== undefined || summary.average_metrics.resting_hr !== undefined) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {summary.average_metrics.resting_heart_rate ?? summary.average_metrics.resting_hr ?? 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Avg Resting HR</p>
              </div>
            )}

            {(summary.average_metrics.sleep_hours !== undefined || summary.average_metrics.sleep_duration_hours !== undefined) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Moon className="w-8 h-8 text-indigo-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {(summary.average_metrics.sleep_hours ?? summary.average_metrics.sleep_duration_hours ?? 0).toFixed(1)}h
                  </span>
                </div>
                <p className="text-sm text-gray-600">Avg Sleep</p>
              </div>
            )}

            {(summary.average_metrics.daily_steps !== undefined || summary.average_metrics.steps !== undefined) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round((summary.average_metrics.daily_steps ?? summary.average_metrics.steps ?? 0) / 1000)}k
                  </span>
                </div>
                <p className="text-sm text-gray-600">Avg Steps</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Welcome! You haven't submitted any check-ins yet.</p>
            <Link
              to="/patient/checkin"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Submit Your First Check-in
            </Link>
          </div>
        )}

        {loadingInsights && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-primary-600" />
              <p className="text-gray-600">Loading health insights...</p>
            </div>
          </div>
        )}

        {!loadingInsights && analysis && (() => {
          const { status, isConsultRecommended } = parseAnalysisStatus(analysis.analysis_text);
          
          return (
            <div className={`p-6 rounded-xl border-2 ${
              isConsultRecommended
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200'
            }`}>
              <div className="flex items-start gap-4">
                {isConsultRecommended ? (
                  <Stethoscope className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    Health Analysis
                    {isConsultRecommended && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        Doctor Visit Recommended
                      </span>
                    )}
                    {status && !isConsultRecommended && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        {status}
                      </span>
                    )}
                  </h3>
                  <div className="text-sm">
                    <FormattedAnalysis text={analysis.analysis_text} />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {!loadingInsights && analysis && !recommendations && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-green-600" />
              <p className="text-gray-600">Loading recommendations...</p>
            </div>
          </div>
        )}

        {!loadingInsights && recommendations && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.evaluation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Evaluation</h4>
                      <div className="text-sm">
                        <FormattedAnalysis text={recommendations.evaluation} />
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What You Should Do</h4>
                    <div className="text-sm">
                      <FormattedAnalysis text={recommendations.recommendations} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recentCheckIns.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Check-ins</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentCheckIns.map((checkin) => (
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
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <span>HR: {checkin.device_data.heart_rate.resting_hr} bpm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                to="/patient/checkin"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View all check-ins →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

