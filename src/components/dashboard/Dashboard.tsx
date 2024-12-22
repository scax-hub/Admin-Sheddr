import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Calendar,
  Bell,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Home,
  Zap
} from 'lucide-react';

interface ActivityLog {
  type: string;
  message: string;
  timestamp: Date;
  icon: any;
}

interface SystemMetric {
  name: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}

interface ChartData {
  name: string;
  schedules: number;
  alerts: number;
}

export default function Dashboard() {
  const { isAuthenticated, userEmail } = useAuth();
  const [stats, setStats] = useState({
    regions: { total: 0, change: 0 },
    suburbs: { total: 0, change: 0 },
    schedules: { total: 0, change: 0 },
    uptime: { value: 0, change: 0 },
    alerts: { total: 0, change: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [previousSchedulesCount, setPreviousSchedulesCount] = useState(0);
  const [previousAlertsCount, setPreviousAlertsCount] = useState(0);
  const [previousRegionsCount, setPreviousRegionsCount] = useState(0);
  const [previousSuburbsCount, setPreviousSuburbsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch regions count
        const regionsSnapshot = await getDocs(collection(db, 'regions'));
        const regionsCount = regionsSnapshot.size;

        // Fetch suburbs directly from suburbs collection
        const suburbsSnapshot = await getDocs(collection(db, 'suburbs'));
        const suburbsCount = suburbsSnapshot.size;

        // Fetch active schedules and calculate alerts
        const now = new Date();
        const schedulesQuery = query(
          collection(db, 'schedules'),
          where('endTime', '>=', now)
        );
        const schedulesSnapshot = await getDocs(schedulesQuery);
        const schedulesCount = schedulesSnapshot.size;
        
        // Count active load shedding events
        const activeLoadShedding = schedulesSnapshot.docs.filter(doc => {
          const data = doc.data();
          const startTime = data.startTime?.toDate();
          const endTime = data.endTime?.toDate();
          return startTime <= now && endTime >= now;
        }).length;

        // Update stats with real data
        setStats({
          regions: { 
            total: regionsCount, 
            change: regionsCount - previousRegionsCount 
          },
          suburbs: {
            total: suburbsCount,
            change: suburbsCount - previousSuburbsCount
          },
          schedules: { 
            total: schedulesCount, 
            change: schedulesCount - previousSchedulesCount 
          },
          uptime: { 
            value: 99.9, 
            change: 0.2 
          },
          alerts: { 
            total: activeLoadShedding,
            change: activeLoadShedding - previousAlertsCount // You'll need to track this
          }
        });

        // Update chart data with schedule analytics
        const last7Days = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date;
        }).reverse();

        const analyticsData = await Promise.all(last7Days.map(async (date) => {
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const daySchedules = query(
            collection(db, 'schedules'),
            where('startTime', '>=', dayStart),
            where('startTime', '<=', dayEnd)
          );

          const scheduleSnapshot = await getDocs(daySchedules);
          const activeEvents = scheduleSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.endTime?.toDate() >= now;
          }).length;

          return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            schedules: scheduleSnapshot.size,
            alerts: activeEvents
          };
        }));

        setChartData(analyticsData);

        // Fetch recent activities
        const activitiesQuery = query(
          collection(db, 'activities'),
          orderBy('timestamp', 'desc'),
          limit(4)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            type: data.type,
            message: data.message,
            timestamp: data.timestamp.toDate(),
            icon: getActivityIcon(data.type)
          };
        });
        setRecentActivities(activities);

        // Fetch system metrics
        const metricsSnapshot = await getDocs(collection(db, 'system_metrics'));
        const metrics = metricsSnapshot.docs.map(doc => ({
          name: doc.data().name,
          value: `${doc.data().value}%`,
          status: doc.data().status
        }));
        setSystemMetrics(metrics);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    setPreviousSchedulesCount(stats.schedules.total);
    setPreviousAlertsCount(stats.alerts.total);
    setPreviousRegionsCount(stats.regions.total);
    setPreviousSuburbsCount(stats.suburbs.total);
  }, [stats.schedules.total, stats.alerts.total, stats.regions.total, stats.suburbs.total]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'schedule': return Calendar;
      case 'alert': return AlertCircle;
      case 'update': return Clock;
      case 'notification': return Bell;
      default: return CheckCircle2;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statsArray = [
    { 
      title: 'Total Regions', 
      value: stats.regions.total.toString(), 
      icon: MapPin,
      change: stats.regions.change > 0 ? `+${stats.regions.change}` : stats.regions.change.toString(),
      changeType: stats.regions.change >= 0 ? 'increase' : 'decrease',
      changePercent: `${Math.abs((stats.regions.change / stats.regions.total) * 100).toFixed(1)}%`
    },
    { 
      title: 'Total Suburbs', 
      value: stats.suburbs.total.toString(), 
      icon: Home,
      change: stats.suburbs.change > 0 ? `+${stats.suburbs.change}` : stats.suburbs.change.toString(),
      changeType: stats.suburbs.change >= 0 ? 'increase' : 'decrease',
      changePercent: `${Math.abs((stats.suburbs.change / stats.suburbs.total) * 100).toFixed(1)}%`
    },
    { 
      title: 'Active Schedules', 
      value: stats.schedules.total.toString(), 
      icon: Calendar,
      change: stats.schedules.change > 0 ? `+${stats.schedules.change}` : stats.schedules.change.toString(),
      changeType: stats.schedules.change >= 0 ? 'increase' : 'decrease',
      changePercent: `${Math.abs((stats.schedules.change / stats.schedules.total) * 100).toFixed(1)}%`
    },
    { 
      title: 'System Uptime', 
      value: `${stats.uptime.value}%`, 
      icon: Activity,
      change: stats.uptime.change > 0 ? `+${stats.uptime.change}` : stats.uptime.change.toString(),
      changeType: stats.uptime.change >= 0 ? 'increase' : 'decrease',
      changePercent: `${stats.uptime.change}%`
    },
    { 
      title: 'Total Alerts', 
      value: stats.alerts.total.toString(), 
      icon: AlertCircle,
      change: stats.alerts.change > 0 ? `+${stats.alerts.change}` : stats.alerts.change.toString(),
      changeType: stats.alerts.change >= 0 ? 'increase' : 'decrease',
      changePercent: `${Math.abs((stats.alerts.change / stats.alerts.total) * 100).toFixed(1)}%`
    }
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statsArray.map((stat, index) => (
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
                {stat.changeType === 'increase' ? '+' : '-'}{stat.changePercent}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {stat.change} from last period
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities and System Status sections remain the same */}

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl shadow-lg p-6 border border-green-100 dark:border-green-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Schedule Analytics
            </h2>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="schedules" fill="#4F46E5" name="Schedules" />
              <Bar dataKey="alerts" fill="#EF4444" name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}