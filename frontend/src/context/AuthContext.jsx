import { createContext, useEffect, useState } from "react";
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

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
