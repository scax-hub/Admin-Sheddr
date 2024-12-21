import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Bell,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  MapPin,
  LineChart,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, userEmail } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    { 
      title: 'Total Regions', 
      value: '24', 
      icon: MapPin,
      change: '+2',
      changeType: 'increase',
      changePercent: '8.3%'
    },
    { 
      title: 'Active Schedules', 
      value: '156', 
      icon: Calendar,
      change: '+12',
      changeType: 'increase',
      changePercent: '12.5%'
    },
    { 
      title: 'System Uptime', 
      value: '99.9%', 
      icon: Activity,
      change: '+0.2',
      changeType: 'increase',
      changePercent: '0.2%'
    },
    { 
      title: 'Total Alerts', 
      value: '5', 
      icon: AlertCircle,
      change: '-3',
      changeType: 'decrease',
      changePercent: '37.5%'
    },
  ];

  const recentActivities = [
    { type: 'schedule', message: 'New schedule added for Region A', time: '5 minutes ago', icon: Calendar },
    { type: 'alert', message: 'System alert resolved in Region B', time: '15 minutes ago', icon: CheckCircle2 },
    { type: 'update', message: 'Schedule updated for Region C', time: '1 hour ago', icon: Clock },
    { type: 'notification', message: 'Maintenance scheduled for tomorrow', time: '2 hours ago', icon: Bell },
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: '45%', status: 'normal' },
    { name: 'Memory Usage', value: '62%', status: 'warning' },
    { name: 'Storage', value: '28%', status: 'normal' },
    { name: 'Network', value: '76%', status: 'normal' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl shadow-xl p-8 text-white transform hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome back, Admin!</h1>
            <p className="mt-2 opacity-90 text-lg">{userEmail}</p>
          </div>
          <Zap className="h-12 w-12 text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} 
               className={`rounded-lg shadow-lg p-6 transition-all hover:scale-105 hover:shadow-xl
                 ${index === 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-t-4 border-blue-500' : ''}
                 ${index === 1 ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-t-4 border-purple-500' : ''}
                 ${index === 2 ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-t-4 border-green-500' : ''}
                 ${index === 3 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/50 border-t-4 border-red-500' : ''}
               `}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${
                index === 0 ? 'bg-blue-200/50 dark:bg-blue-900/50' : 
                index === 1 ? 'bg-purple-200/50 dark:bg-purple-900/50' : 
                index === 2 ? 'bg-green-200/50 dark:bg-green-900/50' : 
                'bg-red-200/50 dark:bg-red-900/50'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  index === 0 ? 'text-blue-700 dark:text-blue-300' : 
                  index === 1 ? 'text-purple-700 dark:text-purple-300' : 
                  index === 2 ? 'text-green-700 dark:text-green-300' : 
                  'text-red-700 dark:text-red-300'
                }`} />
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                stat.changeType === 'increase' 
                  ? 'bg-green-200/50 dark:bg-green-900/50 text-green-800 dark:text-green-200' 
                  : 'bg-red-200/50 dark:bg-red-900/50 text-red-800 dark:text-red-200'
              }`}>
                {stat.changeType === 'increase' ? <ArrowUp className="h-4 w-4 inline mr-1" /> : <ArrowDown className="h-4 w-4 inline mr-1" />}
                {stat.changePercent}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {stat.change} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-blue-100 dark:border-blue-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Recent Activities</h2>
            <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg transition-colors hover:bg-blue-200 dark:hover:bg-blue-800/50">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} 
                   className="flex items-start space-x-4 p-4 rounded-lg transition-all hover:bg-blue-100/50 dark:hover:bg-blue-900/50 cursor-pointer">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-md">
                  <activity.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">System Status</h2>
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-700 font-medium">All systems operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-purple-100 dark:border-purple-800 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">{metric.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <div className="w-full mr-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500
                        ${metric.status === 'warning' 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                          : 'bg-gradient-to-r from-blue-400 to-purple-500'
                        }`}
                      style={{ width: metric.value }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold min-w-[4rem] text-right text-gray-700 dark:text-gray-200">
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl shadow-lg p-6 border border-green-100 dark:border-green-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Schedule Analytics
            </h2>
            <div className="flex space-x-2 ml-4">
              <button className="p-1.5 text-gray-500 hover:text-green-600 transition-colors">
                <LineChart className="h-5 w-5" />
              </button>
              <button className="p-1.5 text-green-600 bg-green-100 rounded">
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <button className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md font-medium">
              Daily
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
              Weekly
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
              Monthly
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-100 dark:border-green-800">
          <BarChart3 className="h-6 w-6 mr-2" />
          <span>Chart placeholder - Add your preferred chart library</span>
        </div>
      </div>
    </div>
  );
}