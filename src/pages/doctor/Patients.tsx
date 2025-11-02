import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { FormattedAnalysis } from '../../components/FormattedAnalysis';
import { doctorAPI } from '../../services/api';
import type { PatientListItem } from '../../types';
import { Search, User, Eye, Brain, Sparkles } from 'lucide-react';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [recommendations, setRecommendations] = useState<{ evaluation: string; recommendations: string } | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await doctorAPI.getPatients();
      setPatients(data.patients);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      loadPatients();
      return;
    }

    try {
      const data = await doctorAPI.searchPatients(searchEmail);
      setPatients(data.patients);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleAnalyze = async (patientId: string) => {
    setSelectedPatient(patientId);
    setAnalysis('');
    try {
      const data = await doctorAPI.analyzePatient(patientId);
      setAnalysis(data.analysis_text);
      setRecommendations(null);
    } catch (error) {
      setAnalysis('Failed to generate analysis');
    }
  };

  const handleGetRecommendations = async (patientId: string) => {
    setSelectedPatient(patientId);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {patients.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No patients found
                  </div>
                ) : (
                  patients.map((patient) => (
                    <div key={patient._id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.email}</p>
                            <p className="text-sm text-gray-500">
                              {patient.age} years old • {patient.sex}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/doctor/patients/${patient._id}`}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          <button
                            onClick={() => handleAnalyze(patient._id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition flex items-center gap-1"
                          >
                            <Brain className="w-4 h-4" />
                            Analyze
                          </button>
                          <button
                            onClick={() => handleGetRecommendations(patient._id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center gap-1"
                          >
                            <Sparkles className="w-4 h-4" />
                            Recommend
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedPatient && analysis && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Analysis
                </h3>
                <div className="text-sm">
                  <FormattedAnalysis text={analysis} />
                </div>
              </div>
            )}

            {selectedPatient && recommendations && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Recommendations
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Evaluation</h4>
                    <div className="text-sm">
                      <FormattedAnalysis text={recommendations.evaluation} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recommendations</h4>
                    <div className="text-sm">
                      <FormattedAnalysis text={recommendations.recommendations} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

