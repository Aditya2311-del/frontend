import { useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { FormattedAnalysis } from '../../components/FormattedAnalysis';
import { patientAPI } from '../../services/api';
import { Brain, Sparkles, FileText, Loader } from 'lucide-react';


export const PatientInsights = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [recommendations, setRecommendations] = useState<{ evaluation: string; recommendations: string } | null>(null);
  const [diseaseSpecific, setDiseaseSpecific] = useState<string>('');
  const [loading, setLoading] = useState<'analysis' | 'recommendations' | 'disease' | null>(null);
  
  // Use refs to track if requests are in progress (prevent race conditions)
  // Refs don't trigger re-renders, but they're checked before state updates
  const isAnalyzingRef = useRef(false);
  const isGettingRecommendationsRef = useRef(false);
  const isGettingDiseaseSpecificRef = useRef(false);

  const handleAnalyze = async () => {
    // Prevent multiple simultaneous calls - check both state and ref
    if (loading === 'analysis' || isAnalyzingRef.current) {
      return;
    }
    
    isAnalyzingRef.current = true;
    setLoading('analysis');
    setAnalysis('');
    
    try {
      const data = await patientAPI.analyzeHealth();
      setAnalysis(data.analysis_text);
    } catch (err: any) {
      const message = err.response?.status === 404
        ? 'No check-in data found. Please submit at least one check-in to generate analysis.'
        : 'Failed to generate analysis. Please try again later.';
      setAnalysis(message);
    } finally {
      setLoading(null);
      isAnalyzingRef.current = false;
    }
  };

  const handleGetRecommendations = async () => {
    // Prevent multiple simultaneous calls - check both state and ref
    if (loading === 'recommendations' || isGettingRecommendationsRef.current) {
      return;
    }
    
    isGettingRecommendationsRef.current = true;
    setLoading('recommendations');
    setRecommendations(null);
    
    try {
      const data = await patientAPI.getRecommendations();
      setRecommendations({ evaluation: data.evaluation, recommendations: data.recommendations });
    } catch (err: any) {
      const message = err.response?.status === 404
        ? 'No check-in data found. Please submit at least one check-in to get recommendations.'
        : 'Failed to generate recommendations. Please try again later.';
      setRecommendations({
        evaluation: 'Unable to generate recommendations',
        recommendations: message,
      });
    } finally {
      setLoading(null);
      isGettingRecommendationsRef.current = false;
    }
  };

  const handleGetDiseaseSpecific = async () => {
    // Prevent multiple simultaneous calls - check both state and ref
    if (loading === 'disease' || isGettingDiseaseSpecificRef.current) {
      return;
    }
    
    isGettingDiseaseSpecificRef.current = true;
    setLoading('disease');
    setDiseaseSpecific('');
    
    try {
      const data = await patientAPI.getDiseaseSpecific();
      setDiseaseSpecific(data.disease_specific_analysis);
    } catch (err: any) {
      const message = err.response?.status === 404
        ? 'No check-in data found. Please submit at least one check-in to generate disease-specific analysis.'
        : 'Failed to generate disease-specific analysis. Please try again later.';
      setDiseaseSpecific(message);
    } finally {
      setLoading(null);
      isGettingDiseaseSpecificRef.current = false;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Health Insights</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Health Analysis</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Get a comprehensive AI analysis of your health data and patterns.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={loading === 'analysis'}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading === 'analysis' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Analysis
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Receive personalized AI recommendations based on your health patterns.
            </p>
            <button
              onClick={handleGetRecommendations}
              disabled={loading === 'recommendations'}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading === 'recommendations' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Recommendations
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Disease-Specific</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Get specialized analysis and insights for your specific health conditions.
            </p>
            <button
              onClick={handleGetDiseaseSpecific}
              disabled={loading === 'disease'}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading === 'disease' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Get Analysis
                </>
              )}
            </button>
          </div>
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

        {diseaseSpecific && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Disease-Specific Analysis
            </h3>
            <div className="text-sm">
              <FormattedAnalysis text={diseaseSpecific} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

