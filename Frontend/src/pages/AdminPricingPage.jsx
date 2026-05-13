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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPricingPage() {
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
      const { data } = await axios.get("http://localhost:5000/api/subscription-plans");
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
      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/subscription-plans/${editingPlan}`, formData, config);
        alert("Plan updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/subscription-plans", formData, config);
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
      await axios.delete(`http://localhost:5000/api/subscription-plans/${id}`, {
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
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h4" mb={4} fontWeight="bold">
        Manage Pricing Plans
      </Typography>

      <Grid container spacing={4}>
        {/* FORM SECTION */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Price (e.g., ₹999 or Custom)"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.recommended}
                      onChange={handleInputChange}
                      name="recommended"
                    />
                  }
                  label="Recommended Plan (Highlight)"
                  sx={{ mt: 2, mb: 2 }}
                />

                <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
                  Features
                </Typography>
                {formData.features.map((feature, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      required
                    />
                    <IconButton color="error" onClick={() => removeFeatureField(index)} disabled={formData.features.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addFeatureField}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1, mb: 3 }}
                >
                  Add Feature
                </Button>

                <Box display="flex" gap={2} mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                  </Button>
                  {editingPlan && (
                    <Button variant="outlined" color="secondary" onClick={resetForm} fullWidth>
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* LIST SECTION */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" mb={2}>
            Existing Plans
          </Typography>
          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} key={plan._id}>
                <Card sx={{ border: plan.recommended ? "2px solid #1976d2" : "1px solid #ccc" }}>
                  <CardContent>
                    {plan.recommended && (
                      <Typography variant="caption" sx={{ bgcolor: "primary.main", color: "#fff", px: 1, py: 0.5, borderRadius: 1 }}>
                        Recommended
                      </Typography>
                    )}
                    <Typography variant="h6" fontWeight="bold" mt={1}>
                      {plan.title}
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {plan.price}
                    </Typography>
                    <Typography color="text.secondary" mb={2} fontSize={14}>
                      {plan.subtitle}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "14px" }}>
                      {plan.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    <Box display="flex" justifyContent="space-between" mt={3}>
                      <Button variant="outlined" size="small" onClick={() => handleEdit(plan)}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(plan._id)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {plans.length === 0 && (
              <Typography color="text.secondary" ml={2}>No plans found. Create one to get started.</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
