import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  userEmail: null,
  setUserEmail: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ 
      userEmail, 
      setUserEmail, 
      isAuthenticated, 
      setIsAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);