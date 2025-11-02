import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { patientAPI } from '../../services/api';
import type { DailyCheckIn } from '../../types';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const CheckIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DailyCheckIn>({
    body_weight_kg: 70,
    illness_symptoms: {
      present: false,
      description: '',
      duration_days: undefined,
    },
    energy_level: 5,
    muscle_soreness: 0,
    mood_state: 5,
    additional_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await patientAPI.submitCheckIn(formData);
      setSuccess(true);
      // Set flag in sessionStorage to trigger dashboard refresh
      sessionStorage.setItem('refreshDashboard', 'true');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in Submitted!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Check-in</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              required
              value={formData.body_weight_kg}
              onChange={(e) => setFormData({ ...formData, body_weight_kg: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-12 text-center">
                {formData.energy_level}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood State</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.mood_state}
                onChange={(e) => setFormData({ ...formData, mood_state: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-12 text-center">
                {formData.mood_state}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Soreness</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.muscle_soreness}
                onChange={(e) => setFormData({ ...formData, muscle_soreness: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-12 text-center">
                {formData.muscle_soreness}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={formData.illness_symptoms.present}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    illness_symptoms: { ...formData.illness_symptoms, present: e.target.checked },
                  })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Experiencing illness symptoms</span>
            </label>
            {formData.illness_symptoms.present && (
              <div className="mt-3 space-y-3 pl-6">
                <input
                  type="text"
                  placeholder="Description of symptoms"
                  value={formData.illness_symptoms.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      illness_symptoms: { ...formData.illness_symptoms, description: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Duration (days)"
                  min="1"
                  value={formData.illness_symptoms.duration_days || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      illness_symptoms: {
                        ...formData.illness_symptoms,
                        duration_days: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              rows={4}
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any additional notes or observations..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Check-in'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

