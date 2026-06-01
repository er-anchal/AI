import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [allowedModules, setAllowedModules] = useState([]);
  const [allowedPaths, setAllowedPaths] = useState([]);
  const [allowedNavItems, setAllowedNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch user profile and permissions whenever token changes
  useEffect(() => {
    const fetchUserAndAccess = async () => {
      if (!token) {
        setUser(null);
        setAllowedModules([]);
        setAllowedPaths([]);
        setAllowedNavItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch user info
        const resUser = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = resUser.data.user;
        setUser(currentUser);

        // 2. Fetch all modules and role access in parallel for speed
        const [resModules, resUserAccess, resRoleAccess] = await Promise.all([
          axios.get(`${API_URL}/modules`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/role-access/${currentUser._id || currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: null })),
          axios.get(`${API_URL}/role-access/role/${currentUser.role}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: null }))
        ]);

        const allModules = resModules.data?.data || [];

        // Check user override first, then fall back to role access
        let moduleAccess = [];
        let subModuleAccess = [];

        if (resUserAccess.data && (resUserAccess.data.moduleAccess?.length > 0 || resUserAccess.data.subModuleAccess?.length > 0)) {
          moduleAccess = resUserAccess.data.moduleAccess || [];
          subModuleAccess = resUserAccess.data.subModuleAccess || [];
        } else if (resRoleAccess.data) {
          moduleAccess = resRoleAccess.data.moduleAccess || [];
          subModuleAccess = resRoleAccess.data.subModuleAccess || [];
        }

        // Filter modules with view permission
        const allowedNames = moduleAccess
          .filter(item => item.permissions?.view)
          .map(item => item.moduleName.toLowerCase().trim());

        const allowedSubNames = subModuleAccess
          .filter(item => item.permissions?.view)
          .map(item => item.subModuleName.toLowerCase().trim());

        const pathsList = [];
        const navItems = [];

        allModules.forEach(mod => {
          const modNameLower = mod.name.toLowerCase().trim();
          const hasModuleAccess = allowedNames.includes(modNameLower);

          // Find permitted submodules
          const activeSubs = (mod.subModules || []).filter(sub =>
            allowedSubNames.includes(sub.name.toLowerCase().trim())
          );

          if (hasModuleAccess || activeSubs.length > 0) {
            // Include top-level path if module view is allowed
            if (hasModuleAccess && mod.path) {
              pathsList.push(mod.path.toLowerCase().trim());
            }

            // Include submodule paths
            activeSubs.forEach(sub => {
              if (sub.path) {
                pathsList.push(sub.path.toLowerCase().trim());
              }
            });

            let pathVal = mod.path || "";
            if (mod.name.toLowerCase().trim() === "home" || mod.path === "/dashboard") {
              if (currentUser.role === "SUPER ADMIN") {
                pathVal = "/admin/dashboard";
              }
            }

            if ((pathVal && pathVal.trim()) || activeSubs.length > 0) {
              navItems.push({
                name: mod.name,
                path: pathVal,
                icon: mod.icon,
                subModules: activeSubs.map(sub => ({
                  name: sub.name,
                  path: sub.path
                }))
              });
            }
          }
        });

        setAllowedModules(allowedNames);
        setAllowedPaths(pathsList);
        setAllowedNavItems(navItems);
      } catch (err) {
        console.error("Fetch user/access error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAccess();
  }, [token]);

  const login = (newToken, role) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", role);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
    setAllowedModules([]);
    setAllowedPaths([]);
    setAllowedNavItems([]);
  };

  return (
    <AuthContext.Provider value={{ token, user, allowedModules, allowedPaths, allowedNavItems, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

