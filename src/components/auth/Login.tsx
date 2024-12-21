import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUserEmail, setIsAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = collection(db, 'UserAuth');
      const q = query(
        userRef, 
        where('email', '==', email),
        where('password', '==', password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('');
        setUserEmail(email);
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl">
          <LogIn className="h-8 w-8" />
          <h2 className="text-2xl font-bold ml-2">SHEDR Login</h2>
        </div>
        
        {error && (
          <div className="bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <Mail className="h-5 w-5 text-indigo-600 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
              required
            />
          </div>
          
          <div>
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <LockKeyhole className="h-5 w-5 text-indigo-600 mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5" /> : 
                  <Eye className="h-5 w-5" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            Secure Admin Access Portal
          </div>
        </div>
      </div>
    </div>
  );
}