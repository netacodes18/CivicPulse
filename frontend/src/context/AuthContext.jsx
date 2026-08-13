import { createContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser(decodedUser);
      setToken(token);
    } catch (err) {
      console.error("Invalid token during login", err);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) return;

    try {
      const decodedUser = jwtDecode(storedToken);
      setUser(decodedUser);
      setToken(storedToken);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

