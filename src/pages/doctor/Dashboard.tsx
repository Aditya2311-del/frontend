import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { doctorAPI } from '../../services/api';
import type { DashboardStats } from '../../types';
import { Users, Activity, FileText, TrendingUp } from 'lucide-react';

export const DoctorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await doctorAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-primary-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.total_patients}</span>
              </div>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.active_patients_last_week}</span>
              </div>
              <p className="text-sm text-gray-600">Active Patients (Last Week)</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.total_checkins}</span>
              </div>
              <p className="text-sm text-gray-600">Total Check-ins</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/doctor/patients"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">View All Patients</p>
                  <p className="text-sm text-gray-600">Manage patient profiles</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

