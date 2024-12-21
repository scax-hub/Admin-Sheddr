import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  Users,
  AlertCircle,
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  Newspaper,
  X,
  MapPin,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Status', href: '/status', icon: AlertCircle },
  { name: 'Data Entry', href: '/users', icon: Users },
  { name: 'Schedules', href: '/schedule', icon: Calendar },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserEmail } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    navigate('/login');
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-lg z-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? 
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" /> : 
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          }
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <div className="h-full flex flex-col bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:via-gray-900 dark:to-black backdrop-blur-xl shadow-2xl">
          {/* Logo Section */}
          <div className="relative h-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_#4F46E5_0%,_transparent_50%)] mix-blend-multiply"></div>
            <div className="relative flex items-center justify-center h-full px-6">
              <h1 className="text-2xl font-bold text-white tracking-wider">SHEDR Admin</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
            {navigation.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200
                    group hover:bg-gray-100 dark:hover:bg-white/10
                    ${isActive ? 'bg-gray-100 dark:bg-white/10' : ''}
                  `}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} 
                  />
                  <span className={`flex-1 text-left font-medium transition-colors
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-2">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 group transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500" />
                  <span className="font-medium group-hover:text-yellow-500">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-blue-500" />
                  <span className="font-medium group-hover:text-blue-500">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 group transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
              <span className="font-medium group-hover:text-red-500 dark:group-hover:text-red-400">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="min-h-screen p-6">
          {children}
        </main>
      </div>
    </div>
  );
}