import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Checkbox,
  Button,
} from "@mui/material";
import { useThemeContext } from "../context/ThemeContext";

const RoleAccess = () => {
  const { state } = useLocation();
  const user = state?.user;
  const API_URL = import.meta.env.VITE_API_URL;
  const TEMP_URL = import.meta.env.VITE_TEMP_URL;
  // Must come after user is defined
  const [selectedModules, setSelectedModules] = useState([]);
  const [existingAccessId, setExistingAccessId] = useState(null);
  const [modules, setModules] = useState([]);

  const {
    // darkMode,
    bgColor,
    cardColor,
    textColor,
    borderColor,
    secondaryText,
  } = useThemeContext();
  // Full corrected fetchModules function

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_URL}/modules`);

      const data = await response.json();

      console.log("Modules API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch modules");
      }

      setModules(data.data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setModules([]);
    }
  };
  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    const fetchRoleAccess = async () => {
      try {
        const res = await fetch(`${API_URL}/role-access/${user._id}`);
        const data = await res.json();

        if (data) {
          setExistingAccessId(data._id);

          const moduleNames =
            data.moduleAccess?.map((item) => item.moduleName) || [];

          setSelectedModules(moduleNames);
        }
      } catch (error) {
        console.error("Error fetching role access:", error);
      }
    };

    if (user?._id) {
      fetchRoleAccess();
    }
  }, [user, API_URL]);
  // Add this temporarily just above the return statement
  console.log("Modules State:", modules);
  // If no user data
  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h5" color="error">
          No user data found.
        </Typography>
      </Box>
    );
  }

  // Toggle module selection
  const handleModuleToggle = (module) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((item) => item !== module)
        : [...prev, module],
    );
  };

  const handleSavePermissions = async () => {
    try {
      // Prepare payload
      const payload = {
        userId: user._id,
        userName: user.name,
        moduleAccess: selectedModules.map((module) => ({
          moduleName: module,
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
          },
        })),
      };

      // If access record already exists -> update it
      // Otherwise create new record
      const url = existingAccessId
        ? `${API_URL}/role-access/${existingAccessId}`
        : `${API_URL}/role-access`;

      const method = existingAccessId ? "PUT" : "POST";

      // API Call
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Convert response to JSON
      const data = await response.json();

      console.log("Save Permissions Response:", data);

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.message || "Failed to save permissions");
      }

      // Save returned document ID for future updates
      if (data?._id) {
        setExistingAccessId(data._id);
      } else if (data?.data?._id) {
        setExistingAccessId(data.data._id);
      }

      alert("Permissions saved successfully.");

      // Optional: reload saved permissions from DB
      const savedModules =
        data?.moduleAccess?.map((item) => item.moduleName) ||
        data?.data?.moduleAccess?.map((item) => item.moduleName) ||
        selectedModules;

      setSelectedModules(savedModules);
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert(error.message || "Failed to save permissions.");
    }
  };

  // User info fields
  const info = [
    { label: "📧 Email", value: user.email },
    { label: "🏢 Company Name", value: user.companyName },
    { label: "💼 Designation", value: user.designation },
    { label: "📱 Phone", value: user.phone },
    { label: "🏙️ City", value: user.city },
    { label: "🧾 GST Number", value: user.gstNumber },
    { label: "🆔 PAN Number", value: user.panNumber },
    { label: "🏷️ Industry", value: user.industry },
    { label: "📦 Plan", value: user.plan || "FREE" },
    {
      label: "📌 Status",
      value: Number(user.isActive) === 0 ? "Active" : "Inactive",
    },
    {
      label: "📅 Created",
      value: new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT SIDE - USER DETAILS (Wider) */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              position: "sticky",
              top: 20,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                {user.name}
              </Typography>

              <Chip
                label={user.role}
                sx={{
                  fontWeight: 600,
                  color: "#fff",
                  bgcolor:
                    user.role === "ADMIN"
                      ? "#ef4444"
                      : user.role === "CLIENT"
                        ? "#13e32f"
                        : user.role === "USER"
                          ? "#1976d2"
                          : "#111827",
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* User details - 3 fields per row */}
            <Grid container spacing={2}>
              {info.map((item, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {item.value || "-"}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT SIDE - MODULE ACCESS (Smaller) */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Module Access Permissions
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Show modules or fallback message */}
            {modules.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{
                  textAlign: "center",
                  py: 4,
                  fontStyle: "italic",
                }}
              >
                No modules found.
              </Typography>
            ) : (
              <Grid container spacing={1.5}>
                {modules.map((module) => (
                  <Grid key={module._id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          height: "20px",
                        }}
                      >
                        <Typography variant="body2">{module.name}</Typography>

                        <Checkbox
                          checked={selectedModules.includes(module.name)}
                          onChange={() => handleModuleToggle(module.name)}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                size="medium"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleAccess;
