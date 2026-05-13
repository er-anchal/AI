import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "./auth/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  "General",
  "Product Shoot",
  "Pricing",
  "Jewellery",
  "Images & Videos",
  "Account & Usage",
];

const AdminFaqPage = () => {
  const { bgColor, textColor, cardColor, borderColor, darkMode } = useThemeContext();
  const { token } = useAuth();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    shortDescription: "",
    answer: "",
    isActive: true,
  });

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/faqs/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs", error);
      setToast({ open: true, message: "Failed to fetch FAQs", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        title: faq.title,
        category: faq.category,
        shortDescription: faq.shortDescription || "",
        answer: faq.answer,
        isActive: faq.isActive,
      });
    } else {
      setEditingFaq(null);
      setFormData({ title: "", category: "General", shortDescription: "", answer: "", isActive: true });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSaveFaq = async () => {
    if (!formData.title || !formData.category || !formData.answer) {
      setToast({ open: true, message: "Please fill required fields", severity: "warning" });
      return;
    }
    setSaving(true);
    try {
      if (editingFaq) {
        await axios.put(`${API_BASE_URL}/faqs/${editingFaq._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: "FAQ updated successfully", severity: "success" });
      } else {
        await axios.post(`${API_BASE_URL}/faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: "FAQ created successfully", severity: "success" });
      }
      handleCloseDialog();
      fetchFaqs();
    } catch (error) {
      setToast({ open: true, message: "Error saving FAQ", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await axios.delete(`${API_BASE_URL}/faqs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: "FAQ deleted successfully", severity: "success" });
        fetchFaqs();
      } catch (error) {
        setToast({ open: true, message: "Error deleting FAQ", severity: "error" });
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor, color: textColor, p: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Manage FAQs
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: "#c6ff00", color: "#000", "&:hover": { bgcolor: "#b3e600" } }}
          >
            Add New FAQ
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
             <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: cardColor, color: textColor, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Title</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Category</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: "bold", textAlign: "right" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: textColor, py: 3 }}>
                      No FAQs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  faqs.map((faq) => (
                    <TableRow key={faq._id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ color: textColor }}>{faq.title}</TableCell>
                      <TableCell sx={{ color: textColor }}>{faq.category}</TableCell>
                      <TableCell sx={{ color: textColor }}>
                         <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: faq.isActive ? "#10b98120" : "#ef444420", color: faq.isActive ? "#10b981" : "#ef4444" }}>
                           {faq.isActive ? "Active" : "Inactive"}
                         </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenDialog(faq)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteFaq(faq._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog for Add/Edit FAQ */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ bgcolor: cardColor, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
            {editingFaq ? "Edit FAQ" : "Add New FAQ"}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: cardColor, color: textColor, pt: 3 }}>
             <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  InputLabelProps={{ style: { color: "text.secondary" } }}
                  sx={{ "& .MuiOutlinedInput-root": { color: textColor, "& fieldset": { borderColor } } }}
                />
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  InputLabelProps={{ style: { color: "text.secondary" } }}
                  sx={{ "& .MuiOutlinedInput-root": { color: textColor, "& fieldset": { borderColor } } }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Short Description (Optional)"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  InputLabelProps={{ style: { color: "text.secondary" } }}
                  sx={{ "& .MuiOutlinedInput-root": { color: textColor, "& fieldset": { borderColor } } }}
                />
                <TextField
                  fullWidth
                  label="Answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleFormChange}
                  required
                  multiline
                  rows={4}
                  InputLabelProps={{ style: { color: "text.secondary" } }}
                  sx={{ "& .MuiOutlinedInput-root": { color: textColor, "& fieldset": { borderColor } } }}
                />
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={formData.isActive} 
                        onChange={handleFormChange} 
                        name="isActive" 
                        color="success"
                      />
                    } 
                    label={formData.isActive ? "Status: Active (Visible to users)" : "Status: Inactive (Hidden from users)"} 
                    sx={{ color: textColor }}
                  />
                </FormGroup>
             </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: cardColor, p: 2, borderTop: `1px solid ${borderColor}` }}>
            <Button onClick={handleCloseDialog} sx={{ color: textColor }}>Cancel</Button>
            <Button onClick={handleSaveFaq} variant="contained" disabled={saving} sx={{ bgcolor: "#c6ff00", color: "#000", "&:hover": { bgcolor: "#b3e600" } }}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminFaqPage;
