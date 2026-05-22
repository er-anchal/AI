import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AdminLayout = () => {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        bgcolor: "background.default",
        transition: "all 0.3s ease"
      }}
    >
      {/* Unified top navbar governed by matrix permissions */}
      <Navbar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
