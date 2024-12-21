// src/pages/DataInsertPage.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { MapPin, Building2, Calendar, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../common/ConfirmDialog';

type EntryMode = 'select' | 'region' | 'suburb' | 'schedule';

interface Suburb {
  name: string;
  id?: string;
}

interface ScheduleSession {
  startTime: string;
  endTime: string;
  period: 'morning' | 'afternoon' | 'evening';
  level: 1 | 2 | 3 | 4;
  day: string;
}

interface ScheduleData {
  suburbId: string;
  regionId: string;
  sessions: ScheduleSession[];
}

interface ExistingSchedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  level: number;
}

export default function DataInsertPage() {
  const [mode, setMode] = useState<EntryMode>('select');
  const [regionName, setRegionName] = useState('');
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<string | null>(null);
  const [suburbInput, setSuburbInput] = useState('');
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [existingSuburbs, setExistingSuburbs] = useState<Suburb[]>([]);
  const [selectedSuburbForSchedule, setSelectedSuburbForSchedule] = useState<string | null>(null);
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [schedulePeriod, setSchedulePeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [scheduleLevel, setScheduleLevel] = useState<1 | 2 | 3 | 4>(1);
  const [scheduleSessions, setScheduleSessions] = useState<ScheduleSession[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [existingSchedules, setExistingSchedules] = useState<ExistingSchedule[]>([]);
  const [isDeleteScheduleOpen, setIsDeleteScheduleOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Fetch existing regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "regions"));
        const regionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRegions(regionData);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);

  const fetchSuburbsForRegion = async (regionId: string) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "suburbs"), where("regionId", "==", regionId))
      );
      const suburbData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Suburb[];
      setExistingSuburbs(suburbData);
    } catch (error) {
      console.error("Error fetching suburbs:", error);
      toast.error('Error fetching suburbs');
    }
  };

  const handleRegionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegionId(regionId);
    setSelectedSuburbForSchedule(null);
    if (regionId) {
      fetchSuburbsForRegion(regionId);
    } else {
      setExistingSuburbs([]);
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) return;

    // Check for existing region with same name
    const regionExists = regions.some(
      region => region.name.toLowerCase() === regionName.trim().toLowerCase()
    );

    if (regionExists) {
      toast.error('A region with this name already exists');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "regions"), {
        name: regionName,
        createdAt: new Date().toISOString()
      });
      toast.success('Region added successfully!', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      setRegionName('');
      // Refresh regions list
      const querySnapshot = await getDocs(collection(db, "regions"));
      const regionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegions(regionData);
    } catch (error) {
      toast.error('Error adding region', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteRegion = async (regionId: string) => {
    setRegionToDelete(regionId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;

    try {
      await deleteDoc(doc(db, "regions", regionToDelete));
      toast.success('Region deleted successfully!', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      // Update regions list
      setRegions(regions.filter(region => region.id !== regionToDelete));
    } catch (error) {
      toast.error('Error deleting region', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      console.error(error);
    }
    setRegionToDelete(null);
  };

  const handleSuburbInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = suburbInput.trim();
      
      // Check if suburb already exists in current session
      const suburbExistsInCurrent = suburbs.some(
        s => s.name.toLowerCase() === value.toLowerCase()
      );

      // Check if suburb already exists in database
      const suburbExistsInDB = existingSuburbs.some(
        s => s.name.toLowerCase() === value.toLowerCase()
      );

      if (suburbExistsInCurrent || suburbExistsInDB) {
        toast.error(`Suburb "${value}" already exists in this region`);
        setSuburbInput('');
        return;
      }

      if (value && suburbs.length < 15) {
        setSuburbs([...suburbs, { name: value }]);
        setSuburbInput('');
      }
    }
  };

  const removeSuburb = (index: number) => {
    setSuburbs(suburbs.filter((_, i) => i !== index));
  };

  const handleSubmitSuburbs = async () => {
    if (!selectedRegionId) {
      toast.error('Please select a region first');
      return;
    }

    if (suburbs.length === 0) {
      toast.error('Please add at least one suburb');
      return;
    }

    setLoading(true);
    try {
      // Add all suburbs to Firestore
      const batch = writeBatch(db);
      const suburbsRef = collection(db, "suburbs");

      suburbs.forEach((suburb) => {
        const newSuburbRef = doc(suburbsRef);
        batch.set(newSuburbRef, {
          name: suburb.name,
          regionId: selectedRegionId,
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();

      toast.success('Suburbs added successfully!', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });

      // Clear the form
      setSuburbs([]);
      setSelectedRegionId('');
    } catch (error) {
      toast.error('Error adding suburbs');
      console.error(error);
    }
    setLoading(false);
  };

  const addScheduleSession = () => {
    if (!scheduleStartTime || !scheduleEndTime) {
      toast.error('Please select both start and end times');
      return;
    }

    if (scheduleStartTime >= scheduleEndTime) {
      toast.error('End time must be after start time');
      return;
    }

    const newSession: ScheduleSession = {
      startTime: scheduleStartTime,
      endTime: scheduleEndTime,
      period: schedulePeriod,
      level: scheduleLevel,
      day: selectedDay
    };

    setScheduleSessions([...scheduleSessions, newSession]);
    setScheduleStartTime('');
    setScheduleEndTime('');
  };

  const handleSubmitSchedule = async () => {
    if (!selectedRegionId || !selectedSuburbForSchedule || scheduleSessions.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const scheduleData: ScheduleData = {
        suburbId: selectedSuburbForSchedule,
        regionId: selectedRegionId,
        sessions: scheduleSessions
      };

      await addDoc(collection(db, "schedules"), scheduleData);

      toast.success('Schedule added successfully!', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#1E293B',
          color: '#fff',
          borderRadius: '10px',
        },
      });

      // Reset form
      setSelectedSuburbForSchedule(null);
      setScheduleSessions([]);
    } catch (error) {
      toast.error('Error adding schedule');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchSuburbSchedules = async (suburbId: string) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "schedules"),
          where("suburbId", "==", suburbId)
        )
      );
      
      const schedules: ExistingSchedule[] = [];
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        data.sessions.forEach((session: ScheduleSession) => {
          schedules.push({
            id: doc.id,
            day: session.day,
            startTime: session.startTime,
            endTime: session.endTime,
            level: session.level
          });
        });
      });

      // Sort schedules by day and time
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      schedules.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff === 0) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dayDiff;
      });

      setExistingSchedules(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error('Error fetching schedules');
    }
  };

  const handleSuburbSelect = (suburbId: string) => {
    // If clicking the same suburb, deselect it
    if (selectedSuburbForSchedule === suburbId) {
      setSelectedSuburbForSchedule(null);
      setExistingSchedules([]);
      // Reset form states
      setScheduleStartTime('');
      setScheduleEndTime('');
      setScheduleSessions([]);
    } else {
      // Select new suburb
      setSelectedSuburbForSchedule(suburbId);
      fetchSuburbSchedules(suburbId);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteDoc(doc(db, "schedules", scheduleToDelete));
      toast.success('Schedule deleted successfully!');
      // Refresh schedules
      if (selectedSuburbForSchedule) {
        fetchSuburbSchedules(selectedSuburbForSchedule);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error('Error deleting schedule');
    }
    setScheduleToDelete(null);
    setIsDeleteScheduleOpen(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900">
      <h1 className="text-2xl text-center font-bold mb-6 text-gray-800 dark:text-white">Data Management</h1>

      {/* Mode Selection */}
      {mode === 'select' && (
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => setMode('region')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Add Regions</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create new regions for load shedding management</p>
          </button>

          <button
            onClick={() => setMode('suburb')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Add Suburbs</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Add suburbs to existing regions</p>
          </button>

          <button
            onClick={() => setMode('schedule')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Create Schedule</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Set up load shedding schedules</p>
          </button>
        </div>
      )}

      {/* Region Management */}
      {mode === 'region' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
              Region Management
            </h2>
            <button
              onClick={() => setMode('select')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back to Selection
            </button>
          </div>

          {/* Add Region Form */}
          <form onSubmit={handleAddRegion} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Region Name
              </label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter region name"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Region'}
            </button>
          </form>

          {/* Regions List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Existing Regions</h3>
            <div className="space-y-3">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                >
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-gray-800 dark:text-white">{region.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID: {region.id}</span>
                    <button
                      onClick={() => handleDeleteRegion(region.id)}
                      className="p-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete Region"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suburb Management */}
      {mode === 'suburb' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
              Suburb Management
            </h2>
            <button
              onClick={() => setMode('select')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back to Selection
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            {/* Region Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Region
              </label>
              <select
                value={selectedRegionId}
                onChange={handleRegionSelect}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Show existing suburbs if a region is selected */}
            {selectedRegionId && existingSuburbs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Existing Suburbs in this Region
                </h4>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {existingSuburbs.map((suburb) => (
                    <div
                      key={suburb.id}
                      className="flex items-center bg-gray-200/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{suburb.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suburbs Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Suburbs (Press Enter or comma to add, max 15)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={suburbInput}
                  onChange={(e) => setSuburbInput(e.target.value)}
                  onKeyDown={handleSuburbInput}
                  disabled={suburbs.length >= 15}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder={suburbs.length >= 15 ? "Maximum suburbs reached" : "Type and press Enter to add suburb"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  {suburbs.length}/15
                </span>
              </div>
            </div>

            {/* Suburbs Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {suburbs.map((suburb, index) => (
                <div
                  key={index}
                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{suburb.name}</span>
                  <button
                    onClick={() => removeSuburb(index)}
                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitSuburbs}
              disabled={loading || suburbs.length === 0 || !selectedRegionId}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding Suburbs...' : 'Add Suburbs'}
            </button>
          </div>
        </div>
      )}

      {/* Schedule Management */}
      {mode === 'schedule' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
              Schedule Management
            </h2>
            <button
              onClick={() => setMode('select')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back to Selection
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            {/* Region Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Region
              </label>
              <select
                value={selectedRegionId}
                onChange={handleRegionSelect}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Suburbs Grid - Only show if region is selected */}
            {selectedRegionId && existingSuburbs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Suburb
                </h3>
                <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {existingSuburbs.map((suburb) => (
                      <button
                        key={suburb.id}
                        onClick={() => handleSuburbSelect(suburb.id)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedSuburbForSchedule === suburb.id
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {suburb.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Form - Only show if suburb is selected */}
            {selectedSuburbForSchedule && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Day
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level
                    </label>
                    <select
                      value={scheduleLevel}
                      onChange={(e) => setScheduleLevel(Number(e.target.value) as any)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      {[1, 2, 3, 4].map(level => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={addScheduleSession}
                      className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Session
                    </button>
                  </div>
                </div>

                {/* Sessions List */}
                {scheduleSessions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Added Sessions
                    </h4>
                    <div className="space-y-2">
                      {scheduleSessions.map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {session.day}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              Level {session.level}
                            </span>
                          </div>
                          <button
                            onClick={() => setScheduleSessions(scheduleSessions.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmitSchedule}
                  disabled={loading || scheduleSessions.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding Schedule...' : 'Submit Schedule'}
                </button>
              </div>
            )}

            {/* Existing Schedules Table */}
            {selectedSuburbForSchedule && existingSchedules.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Existing Schedules
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {existingSchedules.map((schedule, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {schedule.day}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {schedule.startTime} - {schedule.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Level {schedule.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => {
                                setScheduleToDelete(schedule.id);
                                setIsDeleteScheduleOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back Button for other modes */}
      {(mode === 'suburb' || mode === 'schedule') && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setMode('select')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-6"
          >
            Back to Selection
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              This section is under development. Please check back later.
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setRegionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Region"
        message="Are you sure you want to delete this region? This action cannot be undone."
      />

      <ConfirmDialog
        isOpen={isDeleteScheduleOpen}
        onClose={() => {
          setIsDeleteScheduleOpen(false);
          setScheduleToDelete(null);
        }}
        onConfirm={handleDeleteSchedule}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
}
