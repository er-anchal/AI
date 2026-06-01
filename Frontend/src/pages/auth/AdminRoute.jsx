import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function AdminRoute({ children }) {
  const { user, allowedPaths, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#c6ff00" }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SUPER ADMIN has bypass access to all routes to avoid configuration deadlocks
  if (user.role === "SUPER ADMIN") {
    return children;
  }

  const cleanPath = location.pathname.toLowerCase().trim();

  // Strict check: Access to the Role Access Matrix panel is restricted strictly to ADMIN & SUPER ADMIN
  if (cleanPath === "/roleaccess") {
    if (user.role !== "ADMIN" && user.role !== "SUPER ADMIN") {
      return <Navigate to="/" replace />;
    }
  }

  // Allow all authorized administrators to manage blogs
  if (cleanPath === "/admin/blog" && (user.role === "ADMIN" || user.role === "SUPER ADMIN")) {
    return children;
  }

  // Allow standard users to access their dashboard, and admins to access admin dashboard / configurator
  if (cleanPath === "/dashboard" && user) {
    return children;
  }

  // Allow only SUPER ADMIN to access the Admin Dashboard
  if (cleanPath === "/admin/dashboard" && user.role === "SUPER ADMIN") {
    return children;
  }

  // Dynamic Route Access Delegation:
  // - If the user has access to /templates, automatically allow /template-shots and /editor sub-routes.
  // - If the user has access to /dashboard, /templates, or /my-designs, automatically allow /design sub-routes.
  const lowerPaths = allowedPaths.map(p => p.toLowerCase().trim());
  const hasTemplatesAccess = lowerPaths.includes("/templates");
  const hasDashboardAccess = lowerPaths.includes("/dashboard");
  const hasMyDesignsAccess = lowerPaths.includes("/my-designs");

  if (cleanPath.startsWith("/template-shots") && (hasTemplatesAccess || hasDashboardAccess)) {
    return children;
  }

  if (cleanPath.startsWith("/editor") && hasTemplatesAccess) {
    return children;
  }

  if (cleanPath.startsWith("/design") && (hasDashboardAccess || hasTemplatesAccess || hasMyDesignsAccess)) {
    return children;
  }

  // Verify route access against dynamic permissions matrix
  const isAllowed = allowedPaths.some((modPath) => {
    const currentPath = location.pathname.toLowerCase().trim();
    return currentPath === modPath || currentPath.startsWith(modPath + "/");
  });

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

