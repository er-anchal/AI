import React, { useState } from "react";
import { Box, Button, IconButton, Drawer, List, ListItem, Menu, MenuItem, Typography, Avatar, ListItemIcon, Divider } from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/auth/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import WbSunny from "@mui/icons-material/WbSunny";
import Bedtime from "@mui/icons-material/Bedtime";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import EkodexLogoImg from "../assets/images/EkodexLogo.jpg";

const EkodexLogo = ({ isDark }) => (
  <div className="d-flex align-items-center text-decoration-none" style={{ cursor: "pointer" }}>
    <img
      src={EkodexLogoImg}
      alt="Ekodex Logo"
      style={{
        height: "36px",
        borderRadius: "8px",
        boxShadow: isDark ? "0 0 15px rgba(255, 255, 255, 0.05)" : "0 0 10px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.3s ease"
      }}
      className="logo-img"
    />
  </div>
);

// Desktop Sub-menu Dropdown Component
const NavDropdown = ({ item, linkColor, activeLinkColor, darkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const location = useLocation();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isAnySubActive = item.subModules?.some(sub => location.pathname === sub.path) || false;

  return (
    <Box>
      <Button
        onClick={handleClick}
        className={`hover-nav-link ${isAnySubActive ? "active" : ""}`}
        sx={{
          color: isAnySubActive ? activeLinkColor : linkColor,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          p: 0,
          minWidth: 0,
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            width: isAnySubActive ? "90%" : "0%",
            height: "2px",
            bottom: "-4px",
            left: "50%",
            background: "linear-gradient(90deg, #B6FF2A 0%, #00E676 100%)",
            transition: "all 0.25s ease",
            transform: "translateX(-50%)",
          },
          "&:hover::after": {
            width: "90%",
          }
        }}
      >
        {item.name} <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>▼</span>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        PaperProps={{
          sx: {
            mt: 1.5,
            bgcolor: darkMode ? "#0b1120" : "#ffffff",
            border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"}`,
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            py: 0.5,
            minWidth: "180px",
          }
        }}
      >
        {item.subModules.map((sub) => (
          <MenuItem
            key={sub.name}
            onClick={handleClose}
            sx={{
              p: 0,
              "&:hover": {
                bgcolor: "transparent"
              }
            }}
          >
            <NavLink
              to={sub.path}
              style={({ isActive }) => ({
                color: isActive ? activeLinkColor : linkColor,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                width: "100%",
                padding: "10px 20px",
                display: "block",
                fontFamily: "'Outfit', 'Inter', sans-serif",
                background: isActive ? (darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)") : "transparent"
              })}
            >
              {sub.name}
            </NavLink>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const Navbar = () => {
  const { token, logout, allowedNavItems, user } = useAuth();
  const isLoggedIn = !!token;
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme, textColor } = useThemeContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };


  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Nav colors depending on theme
  const navBgColor = darkMode ? "rgba(11, 17, 32, 0.8)" : "rgba(255, 255, 255, 0.85)";
  const navBorderColor = darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)";
  const linkColor = darkMode ? "rgba(255, 255, 255, 0.65)" : "rgba(15, 23, 42, 0.65)";
  const activeLinkColor = darkMode ? "#ffffff" : "#0f172a";

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    if (!isLoggedIn) {
      navigate("/");
    } else {
      if (user?.role === "SUPER ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  // Static public links for unauthenticated users
  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact-us" },
    { name: "Company", path: "/company" }
  ];

  // Dynamic vs Static selection
  const navLinks = isLoggedIn ? allowedNavItems : publicLinks;

  const neonButtonStyle = {
    color: "#030712",
    background: "linear-gradient(135deg, #B6FF2A 0%, #00E676 100%)",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.85rem",
    px: 3,
    py: 1,
    borderRadius: "50px",
    boxShadow: darkMode ? "0 4px 15px rgba(182, 255, 42, 0.3)" : "0 4px 12px rgba(0, 230, 118, 0.2)",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    "&:hover": {
      background: "linear-gradient(135deg, #00E676 0%, #B6FF2A 100%)",
      boxShadow: darkMode ? "0 8px 25px rgba(182, 255, 42, 0.5)" : "0 6px 18px rgba(0, 230, 118, 0.35)",
      transform: "translateY(-1.5px) scale(1.02)"
    }
  };

  const logoutButtonStyle = {
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.85rem",
    px: 3,
    py: 0.8,
    borderRadius: "50px",
    transition: "all 0.25s ease",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    "&:hover": {
      background: "rgba(239, 68, 68, 0.06)",
      borderColor: "#ef4444",
      transform: "translateY(-1px)"
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: navBgColor,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${navBorderColor}`,
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "background-color 0.3s ease, border-color 0.3s ease"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .hover-nav-link {
          position: relative;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 6px 4px;
          transition: color 0.25s ease;
        }

        .hover-nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background: linear-gradient(90deg, #B6FF2A 0%, #00E676 100%);
          transition: all 0.25s ease;
          transform: translateX(-50%);
        }

        .hover-nav-link:hover::after, .hover-nav-link.active::after {
          width: 90%;
        }

        .logo-img:hover {
          transform: scale(1.03);
        }
      `}</style>

      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand Logo */}
        <div onClick={handleHomeClick} className="d-flex align-items-center">
          <EkodexLogo isDark={darkMode} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="d-none d-lg-flex align-items-center gap-4">
          {navLinks.map((link) => {
            if (link.subModules && link.subModules.length > 0) {
              return (
                <NavDropdown
                  key={link.name}
                  item={link}
                  linkColor={linkColor}
                  activeLinkColor={activeLinkColor}
                  darkMode={darkMode}
                />
              );
            }
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end
                className={({ isActive }) =>
                  `hover-nav-link ${isActive ? "active" : ""}`
                }
                style={({ isActive }) => ({
                  color: isActive ? activeLinkColor : linkColor
                })}
              >
                {link.name}
              </NavLink>
            );
          })}
        </div>

        {/* Action Controls & Theme Toggle */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: textColor,
              p: "10px",
              borderRadius: "50%",
              transition: "transform 0.3s ease",
              "&:hover": {
                background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                transform: "rotate(15deg)"
              }
            }}
          >
            {darkMode ? <WbSunny sx={{ fontSize: 20 }} /> : <Bedtime sx={{ fontSize: 20 }} />}
          </IconButton>

          {!isLoggedIn ? (
            <>
              <Button
                onClick={() => navigate("/login")}
                sx={neonButtonStyle}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                sx={neonButtonStyle}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <IconButton
                onClick={() => navigate("/notifications")}
                sx={{
                  color: textColor,
                  p: "10px",
                  borderRadius: "50%",
                  "&:hover": {
                    background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  }
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </IconButton>


              <Avatar
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: "#c6ff00",
                  color: "#000",
                  cursor: "pointer",
                  width: 36,
                  height: 36,
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                disableScrollLock
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    bgcolor: darkMode ? "#0b1120" : "#ffffff",
                    border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"}`,
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                    py: 0.5,
                    minWidth: "180px",
                  }
                }}
              >
                <MenuItem disabled sx={{ opacity: "0.8 !important", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  Welcome, {user?.name || "User"}
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={handleProfile}
                  sx={{
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: linkColor,
                    "&:hover": {
                      color: activeLinkColor,
                      bgcolor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#ef4444",
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.06)"
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: "#ef4444" }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Controls Toggle */}
        <div className="d-flex d-lg-none align-items-center gap-2">
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: textColor,
              p: "8px",
              borderRadius: "50%"
            }}
          >
            {darkMode ? <WbSunny sx={{ fontSize: 20 }} /> : <Bedtime sx={{ fontSize: 20 }} />}
          </IconButton>

          <IconButton
            onClick={toggleMobileMenu}
            sx={{
              color: textColor,
              p: "8px",
              borderRadius: "50%"
            }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: "280px",
            background: darkMode ? "#0b1120" : "#ffffff",
            borderLeft: `1px solid ${navBorderColor}`,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }
        }}
      >
        <Box>
          <Box className="d-flex align-items-center justify-content-between mb-4">
            <EkodexLogo isDark={darkMode} />
            <IconButton onClick={toggleMobileMenu} sx={{ color: textColor }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {navLinks.map((link) => {
              if (link.subModules && link.subModules.length > 0) {
                return (
                  <Box key={link.name} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        fontWeight: 700,
                        color: darkMode ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.4)",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        mt: 0.5
                      }}
                    >
                      {link.name}
                    </Typography>
                    {link.subModules.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        onClick={toggleMobileMenu}
                        className={({ isActive }) =>
                          `hover-nav-link w-100 py-1.5 ${isActive ? "active" : ""}`
                        }
                        style={({ isActive }) => ({
                          color: isActive ? activeLinkColor : linkColor,
                          paddingLeft: "12px",
                          borderLeft: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)"}`
                        })}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </Box>
                );
              }
              return (
                <ListItem
                  key={link.name}
                  disablePadding
                  onClick={toggleMobileMenu}
                >
                  <NavLink
                    to={link.path}
                    end
                    className={({ isActive }) =>
                      `hover-nav-link w-100 py-2 ${isActive ? "active" : ""}`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? activeLinkColor : linkColor
                    })}
                  >
                    {link.name}
                  </NavLink>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box className="d-flex flex-column gap-3 mt-4">
          {!isLoggedIn ? (
            <>
              <Button
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/login");
                }}
                sx={{ ...neonButtonStyle, width: "100%" }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/register");
                }}
                sx={{ ...neonButtonStyle, width: "100%" }}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  toggleMobileMenu();
                  navigate("/profile");
                }}
                sx={{ ...neonButtonStyle, width: "100%" }}
              >
                Profile
              </Button>
              <Button
                onClick={() => {
                  toggleMobileMenu();
                  handleLogout();
                }}
                sx={{ ...logoutButtonStyle, width: "100%" }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;
