import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  Building2,
  CalendarClock,
  ArrowRight
} from 'lucide-react';

interface Schedule {
  id: string;
  suburb: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface Suburb {
  id: string;
  name: string;
  region: string;
}

export default function LocationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - Replace with your Firestore data
  const schedules: Schedule[] = [
    {
      id: '1',
      suburb: 'Northcliff',
      date: '2024-03-15',
      startTime: '08:00',
      endTime: '12:00',
      status: 'active'
    },
    // Add more mock data
  ];

  // Mock suburbs data - Replace with your Firestore data
  const suburbs: Suburb[] = [
    { id: '1', name: 'Northcliff', region: 'Region A' },
    { id: '2', name: 'Northgate', region: 'Region B' },
    { id: '3', name: 'North Riding', region: 'Region A' },
    { id: '4', name: 'Sandton', region: 'Region C' },
    { id: '5', name: 'Southdale', region: 'Region D' },
    { id: '6', name: 'Soweto', region: 'Region D' },
  ];

  const filteredSuburbs = suburbs.filter(suburb =>
    suburb.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuburb = (suburb: Suburb) => {
    setSearchTerm(suburb.name);
    setShowSuggestions(false);
    // Add your search logic here
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center mb-4">
            <MapPin className="h-8 w-8 mr-3" />
            Location Schedules
          </h1>
          <p className="text-blue-100 text-lg">Manage and monitor load shedding schedules across different regions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Search Bar with Suggestions */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter suburb name..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {filteredSuburbs.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {filteredSuburbs.map((suburb) => (
                        <button
                          key={suburb.id}
                          onClick={() => handleSelectSuburb(suburb)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-medium text-gray-700">
                              {suburb.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 group-hover:text-blue-600">
                            {suburb.region}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No suburbs found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">All Schedules</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} 
               className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 ml-3">
                  {schedule.suburb}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{new Date(schedule.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{schedule.startTime} - {schedule.endTime}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <CalendarClock className="h-5 w-5 mr-3 text-blue-500" />
                  <span>4 hours duration</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4 bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <button className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {schedules.length === 0 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="p-3 bg-red-50 rounded-full w-fit mx-auto mb-4">
            <MapPin className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Schedules Found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
}