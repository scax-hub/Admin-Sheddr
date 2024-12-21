import { useState } from 'react';
import { Settings as Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dataRetention, setDataRetention] = useState('30');

  return (
    <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
      <h1 className="text-2xl text-center font-bold mb-6 text-gray-800 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications for updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Email Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Data Retention</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose how long to keep historical data</p>
            </div>
          </div>
          <div className="mt-4">
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}