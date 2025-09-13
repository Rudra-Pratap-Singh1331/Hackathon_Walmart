// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import  jwtDecode  from "jwt-decode"; // ✅ FIXED
import { AuthContext } from "../Context/AuthContext"; // ✅ Use lowercase 'context' if that's your folder name

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // ✅ FIXED
        setUser({ ...decoded, token });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
