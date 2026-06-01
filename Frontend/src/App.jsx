import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

import { useThemeContext } from "./context/ThemeContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import AdminRoute from "./pages/auth/AdminRoute";
import TemplatesPage from "./pages/Templates";
import CategoriesPage from "./pages/CategoriesPage";
import SubcategoriesPage from "./pages/SubcategoriesPage";
import AdminPricingPage from "./pages/AdminPricingPage";
import PricingPage from "./pages/PricingPage";
import FaqPage from "./pages/FaqPage";
import AddTemplatePage from "./pages/AddTemplatePage";
import TemplateShotsPage from "./pages/TemplateShotsPage";
import AdminFaqPage from "./pages/AdminFaqPage";
import AdminQueriesPage from "./pages/AdminQueriesPage";
import UserDashboard from "./pages/UserDashboard";
import UserCreation from "./pages/UserCreation";
import RoleAccess from "./pages/RoleAccess";
import ContactUs from "./pages/ContactUs";
import AdminDashboard from "./pages/AdminDashboard";
import ImageResult from "./pages/ImageResult";
import Blog from "./pages/Blog";


import CreateReel from "./pages/CreateReel";
import UserDesigns from "./pages/UserDesigns";
import Favorites from "./pages/Favorites";
import MyFlipBooks from "./pages/MyFlipBooks";
import FlipBookViewer from "./pages/FlipBookViewer";

import Editor from "./pages/Editor";
import DesignFrameCanvas from "./components/DesignFrameCanvas";

/* ---------------- CANVAS LAYOUT ---------------- */
function CanvasLayout({ children }) {
  const { bgColor } = useThemeContext();

  return (
    <Box
      sx={{
        height: {
          xs: "calc(100dvh - 56px)",
          sm: "calc(100dvh - 64px)",
        },
        overflow: "hidden",
        display: "flex",
        bgcolor: bgColor,
      }}
    >
      {children}
    </Box>
  );
}


/* ---------------- PUBLIC LAYOUT ---------------- */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </>
  );
}

/* ---------------- APP ---------------- */
function App() {
  const { bgColor, textColor } = useThemeContext();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: bgColor,
        color: textColor,
        display: "flex",
        flexDirection: "column",
        transition: "0.3s ease",
      }}
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/image-results" element={<ImageResult />} />


          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <UserDashboard />
              </AdminRoute>
            }
          />
          <Route path="/create-reel" element={<AdminRoute><CreateReel /></AdminRoute>} />
          <Route path="/my-designs" element={<AdminRoute><UserDesigns /></AdminRoute>} />
          <Route path="/favorites" element={<AdminRoute><Favorites /></AdminRoute>} />
          <Route path="/my-magazines" element={<AdminRoute><MyFlipBooks /></AdminRoute>} />
          <Route path="/magazines/:id" element={<AdminRoute><FlipBookViewer /></AdminRoute>} />
          <Route path="/editor/:templateId" element={<AdminRoute><Editor mode="design" /></AdminRoute>} />
          <Route path="/design/:templateId" element={<AdminRoute><CanvasLayout><DesignFrameCanvas /></CanvasLayout></AdminRoute>} />
          <Route path="/design/new" element={<AdminRoute><CanvasLayout><DesignFrameCanvas /></CanvasLayout></AdminRoute>} />
          <Route path="/design/edit/:designId" element={<AdminRoute><CanvasLayout><DesignFrameCanvas /></CanvasLayout></AdminRoute>} />
        </Route>


        {/* ADMIN ROUTES */}
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/blog"
            element={
              <AdminRoute>
                <Blog isAdminView={true} />
              </AdminRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <AdminRoute>
                <CategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/subcategories"
            element={
              <AdminRoute>
                <SubcategoriesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <AdminRoute>
                <TemplatesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/template-shots"
            element={
              <AdminRoute>
                <TemplateShotsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/template-shots/:templateId"
            element={
              <AdminRoute>
                <TemplateShotsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/templates/add"
            element={
              <AdminRoute>
                <AddTemplatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <AdminRoute>
                <AdminPricingPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <AdminRoute>
                <AdminFaqPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/queries"
            element={
              <AdminRoute>
                <AdminQueriesPage />
              </AdminRoute>
            }
          />

          <Route
            path="/usercreation"
            element={
              <AdminRoute>
                <UserCreation />
              </AdminRoute>
            }
          />
          <Route
            path="/roleaccess"
            element={
              <AdminRoute>
                <RoleAccess />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
