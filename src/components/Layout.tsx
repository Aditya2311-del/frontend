import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, Home, User, FileText, BarChart3, Brain } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';

  const patientLinks = [
    { to: '/patient/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/patient/checkin', icon: FileText, label: 'Check-in' },
    { to: '/patient/profile', icon: User, label: 'Profile' },
    { to: '/patient/insights', icon: Brain, label: 'Insights' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/doctor/patients', icon: User, label: 'Patients' },
  ];

  const links = isPatient ? patientLinks : doctorLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Activity className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">GlucoSense</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

