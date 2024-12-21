import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import LoadSheddingStatus from './components/status/LoadSheddingStatus';
import DataInsertPage from './components/dataentry/DataInsertPage';
import News from './components/news/NewsList';
import Schedule from './components/schedules/ScheduleList';
import Settings from './components/settings/Settings';
import { Layout } from './components/dashboard/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/status" element={
          <Layout>
            <LoadSheddingStatus />
          </Layout>
        } />
        <Route path="/users" element={
          <Layout>
            <DataInsertPage />
          </Layout>
        } />
        <Route path="/news" element={
          <Layout>
            <News />
          </Layout>
        } />
        <Route path="/schedule" element={
          <Layout>
            <Schedule />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;