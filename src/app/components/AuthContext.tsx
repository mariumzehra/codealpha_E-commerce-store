import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Order {
  id: string;
  date: string;
  items: any[];
  shippingAddress: any;
  total: number;
  status: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  orders?: Order[];
  savedAddresses?: any[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  addOrder: (order: Order) => void;
  getUserOrders: () => Order[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize demo account
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
      const demoUsers = [
        {
          id: 1,
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'demo123',
        },
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (email: string, password: string, rememberMe = false): boolean => {
    // Mock authentication - in real app, this would call an API
    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        orders: foundUser.orders || [],
        savedAddresses: foundUser.savedAddresses || [],
      };
      setUser(userData);

      if (rememberMe) {
        const token = btoa(JSON.stringify({ email, timestamp: Date.now() }));
        localStorage.setItem('authToken', token);
        // Set cookie expiry to 30 days
        document.cookie = `authToken=${token}; max-age=${30 * 24 * 60 * 60}; path=/`;
      }

      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    // Mock signup - in real app, this would call an API
    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=; max-age=0; path=/';
  };

  const addOrder = (order: Order) => {
    if (!user) return;

    const savedUsers = localStorage.getItem('users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        const userOrders = u.orders || [];
        return { ...u, orders: [...userOrders, order] };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUser({ ...user, orders: [...(user.orders || []), order] });
  };

  const getUserOrders = (): Order[] => {
    return user?.orders || [];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        addOrder,
        getUserOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
