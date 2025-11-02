import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import type { SignUpRequest } from '../types';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SignUpRequest>({
    email: '',
    password: '',
    age: 30,
    height_cm: 170,
    sex: 'male',
    medical_history: {
      chronic_conditions: [],
      past_surgeries: [],
      current_medications: [],
      known_allergies: [],
    },
    family_history: {
      heart_disease: false,
      diabetes: false,
      cancer: false,
      other_hereditary_conditions: [],
    },
    lifestyle_factors: {
      smoking_status: 'never',
      alcohol_consumption: 'occasionally',
      exercise_habits: 'moderate',
    },
  });

  const [chronicCondition, setChronicCondition] = useState('');
  const [medication, setMedication] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addChronicCondition = () => {
    if (chronicCondition.trim()) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          chronic_conditions: [...formData.medical_history.chronic_conditions, chronicCondition.trim()],
        },
      });
      setChronicCondition('');
    }
  };

  const addMedication = () => {
    if (medication.trim()) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          current_medications: [...formData.medical_history.current_medications, medication.trim()],
        },
      });
      setMedication('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join GlucoSense today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                required
                min={50}
                max={250}
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={chronicCondition}
                    onChange={(e) => setChronicCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChronicCondition())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Type 2 Diabetes"
                  />
                  <button
                    type="button"
                    onClick={addChronicCondition}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medical_history.chronic_conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {cond}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            medical_history: {
                              ...formData.medical_history,
                              chronic_conditions: formData.medical_history.chronic_conditions.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Metformin"
                  />
                  <button
                    type="button"
                    onClick={addMedication}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medical_history.current_medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            medical_history: {
                              ...formData.medical_history,
                              current_medications: formData.medical_history.current_medications.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family History</h3>
            <div className="space-y-2">
              {(['heart_disease', 'diabetes', 'cancer'] as const).map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.family_history[condition]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        family_history: { ...formData.family_history, [condition]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{condition.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
                <select
                  value={formData.lifestyle_factors.smoking_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle_factors: { ...formData.lifestyle_factors, smoking_status: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption</label>
                <select
                  value={formData.lifestyle_factors.alcohol_consumption}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle_factors: { ...formData.lifestyle_factors, alcohol_consumption: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="never">Never</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="regularly">Regularly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Habits</label>
                <select
                  value={formData.lifestyle_factors.exercise_habits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle_factors: { ...formData.lifestyle_factors, exercise_habits: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

