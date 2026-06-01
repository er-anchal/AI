import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Container,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import axios from "axios";
import { useThemeContext } from "../context/ThemeContext";

export default function AdminPricingPage() {
  const { bgColor, textColor, cardColor, darkMode } = useThemeContext();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    subtitle: "",
    features: [""],
    recommended: false,
  });

  const fetchPlans = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(`${apiBase}/subscription-plans`);
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeatureField = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan._id);
    setFormData({
      title: plan.title,
      price: plan.price,
      subtitle: plan.subtitle || "",
      features: plan.features.length ? plan.features : [""],
      recommended: plan.recommended || false,
    });
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      title: "",
      price: "",
      subtitle: "",
      features: [""],
      recommended: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const apiBase = import.meta.env.VITE_API_URL;
      if (editingPlan) {
        await axios.put(`${apiBase}/subscription-plans/${editingPlan}`, formData, config);
        alert("Plan updated successfully");
      } else {
        await axios.post(`${apiBase}/subscription-plans`, formData, config);
        alert("Plan created successfully");
      }
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    const token = localStorage.getItem("token");
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiBase}/subscription-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Plan deleted successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete plan");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor, px: 4, pt: 1.5, pb: 3, width: "100%", boxSizing: "border-box" }}>
      <Typography variant="h4" mb={4} fontWeight="bold" textAlign="left">
        Manage Pricing Plans
      </Typography>

      {/* FORM SECTION (Paper Container) */}
      <Paper
        sx={{
          p: 4,
          mb: 6,
          bgcolor: cardColor,
          color: textColor,
          border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0"}`,
          borderRadius: "16px",
          boxShadow: darkMode ? "none" : "0 4px 20px rgba(0,0,0,0.01)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h6" mb={3} fontWeight={700}>
          {editingPlan ? "Edit Pricing Plan" : "Add New Pricing Plan"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Row 1: Title, Price, Subtitle */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
                gap: 3
              }}
            >
              <TextField
                fullWidth
                label="Plan Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& .MuiOutlinedInput-input': { py: 1.6, px: 2 }
                }}
              />
              <TextField
                fullWidth
                label="Price (e.g., ₹999 or Custom)"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& .MuiOutlinedInput-input': { py: 1.6, px: 2 }
                }}
              />
              <TextField
                fullWidth
                label="Subtitle / Short Description"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& .MuiOutlinedInput-input': { py: 1.6, px: 2 }
                }}
              />
            </Box>

            {/* Row 2: Features, Add Button */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                gap: 3,
                alignItems: "start",
                mt: 1
              }}
            >
              {/* Feature Inputs Map */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {formData.features.map((feature, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1.5}>
                    <TextField
                      fullWidth
                      placeholder={`Feature description #${index + 1}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                        '& .MuiOutlinedInput-input': { py: 1.6, px: 2 }
                      }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeFeatureField(index)}
                      disabled={formData.features.length === 1}
                      sx={{
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "12px",
                        height: "56px",
                        width: "56px"
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Add Feature Button */}
              <Box sx={{ display: "flex", alignItems: "center", height: { md: "56px" } }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addFeatureField}
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    height: "56px",
                    px: 3,
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1",
                    color: textColor,
                    "&:hover": { borderColor: darkMode ? "#c6ff00" : "#1976d2" },
                    width: { xs: "100%", md: "auto" }
                  }}
                >
                  Add Feature Item
                </Button>
              </Box>
            </Box>

            {/* Row 3: Recommended Toggle */}
            <Box
              display="flex"
              alignItems="center"
              px={2}
              py={1.5}
              sx={{
                border: "1px solid",
                borderColor: formData.recommended
                  ? "primary.main"
                  : darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                borderRadius: 2,
                bgcolor: formData.recommended
                  ? darkMode ? "rgba(25,118,210,0.15)" : "rgba(25,118,210,0.07)"
                  : "transparent",
                transition: "all 0.25s ease",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.recommended}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, recommended: e.target.checked }))
                    }
                    name="recommended"
                    color="primary"
                    sx={{
                      "& .MuiSwitch-switchBase": {
                        color: darkMode ? "#90caf9" : "#1976d2",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#1976d2",
                      },
                      "& .MuiSwitch-track": {
                        bgcolor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: textColor, lineHeight: 1.2 }}>
                      Recommended Plan
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
                      Highlights this plan with a badge on the pricing page
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Box>

            {/* Row 4: Submit Buttons */}
            <Box sx={{ display: "flex", gap: 3, justifyContent: "flex-start", alignItems: "center", mt: 2, flexWrap: "wrap" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  width: { xs: "100%", md: "250px" },
                  bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                  color: darkMode ? "#000" : "#fff",
                  borderRadius: "30px",
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: "1rem",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: darkMode ? "#b3e600" : "#1565c0",
                  }
                }}
              >
                {loading ? "Saving Plan..." : editingPlan ? "Update Plan" : "Create Plan"}
              </Button>

              {editingPlan && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{
                    width: { xs: "100%", md: "200px" },
                    borderRadius: "30px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: textColor,
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1",
                    ml: "auto"
                  }}
                >
                  Cancel Editing
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      {/* LIST SECTION */}
      <Box sx={{ width: "100%" }}>
        <Typography variant="h5" fontWeight={700} mb={4} textAlign="left">
          Existing Pricing Plans
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)"
            },
            gap: 3
          }}
        >
          {plans.map((plan) => (
            <Box key={plan._id} sx={{ display: "flex", width: "100%", minWidth: 0 }}>
              <Card
                sx={{
                  border: plan.recommended
                    ? "2px solid #1976d2"
                    : `1px solid ${darkMode ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1"}`,
                  boxShadow: plan.recommended
                    ? `0 0 0 3px ${darkMode ? "rgba(25,118,210,0.25)" : "rgba(25,118,210,0.15)"}`
                    : "none",
                  bgcolor: cardColor,
                  color: textColor,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "16px",
                  position: "relative",
                  overflow: "visible",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: plan.recommended
                      ? `0 0 0 3px rgba(25,118,210,0.3), 0 12px 32px rgba(25,118,210,0.15)`
                      : "0 10px 30px rgba(0,0,0,0.05)",
                  }
                }}
              >

                {/* Recommended Badge — top-right border pill */}
                {plan.recommended && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -13,
                      right: 16,
                      bgcolor: "#1976d2",
                      color: "#fff",
                      px: 1.5,
                      py: 0.3,
                      borderRadius: "20px",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      boxShadow: "0 2px 8px rgba(25,118,210,0.4)",
                      zIndex: 3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ★ Recommended
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3, "&:last-child": { pb: 3 } }}>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, textAlign: "left", color: textColor }}>
                    {plan.title}
                  </Typography>

                  <Typography color="text.secondary" fontSize={12} sx={{ mt: 0.5, mb: 1, textAlign: "left" }}>
                    {plan.subtitle}
                  </Typography>

                  <Typography variant="h5" color={darkMode ? "#c6ff00" : "primary.main"} fontWeight={900} sx={{ mt: 1.5, mb: 2.5, textAlign: "left" }}>
                    {plan.price}
                  </Typography>

                  {/* Checklist features styling with checkmarks */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.2, wordBreak: "break-word" }}>
                    {plan.features.map((f, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <CheckIcon sx={{ color: darkMode ? "#c6ff00" : "success.main", fontSize: 15, mt: 0.3 }} />
                        <Typography fontSize={12} color={textColor} sx={{ textAlign: "left", lineHeight: 1.3 }}>
                          {f}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box display="flex" gap={1} sx={{ mt: "auto", pt: "30px" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(plan)}
                      sx={{
                        flex: 1,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1",
                        color: textColor,
                        borderRadius: "6px",
                        py: 0.5,
                        "&:hover": { borderColor: darkMode ? "#c6ff00" : "#1976d2" }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(plan._id)}
                      sx={{
                        flex: 1,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: "6px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        py: 0.5,
                        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.05)", borderColor: "#ef4444" }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}

          {plans.length === 0 && (
            <Typography color="text.secondary" ml={2}>No plans found. Create one to get started.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
