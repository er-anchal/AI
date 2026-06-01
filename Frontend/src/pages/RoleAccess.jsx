import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Grid,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useThemeContext } from "../context/ThemeContext";

const RoleAccess = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { darkMode, bgColor, cardColor, textColor, borderColor } = useThemeContext();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for dynamic creation
  const [creationType, setCreationType] = useState("MODULE"); // "MODULE" or "SUBMODULE"
  const [selectedParentId, setSelectedParentId] = useState("");
  const [newModuleName, setNewModuleName] = useState("");
  const [newModulePath, setNewModulePath] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [adding, setAdding] = useState(false);

  // State for active item editing
  const [editingItem, setEditingItem] = useState(null); // { id, type, name, path, sortOrder, parentModule }

  const roles = ["CLIENT", "USER", "ADMIN", "SUPER ADMIN"];

  // Nested matrix state
  const [matrix, setMatrix] = useState({
    CLIENT: { modules: [], subModules: [] },
    USER: { modules: [], subModules: [] },
    ADMIN: { modules: [], subModules: [] },
    "SUPER ADMIN": { modules: [], subModules: [] },
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  const fetchModulesAndMatrix = async (preserveLocalMatrix = false) => {
    try {
      if (!preserveLocalMatrix) {
        setLoading(true);
      }

      // 1. Fetch all active modules (with populated submodules)
      const resModules = await fetch(`${API_URL}/modules`, {
        headers: getHeaders()
      });
      const dataModules = await resModules.json();
      const loadedModules = dataModules.data || [];
      setModules(loadedModules);

      if (!preserveLocalMatrix) {
        // 2. Fetch role accesses from the database
        const resAccess = await fetch(`${API_URL}/role-access`, {
          headers: getHeaders()
        });
        const dataAccess = await resAccess.json();

        const newMatrix = {
          CLIENT: { modules: [], subModules: [] },
          USER: { modules: [], subModules: [] },
          ADMIN: { modules: [], subModules: [] },
          "SUPER ADMIN": { modules: [], subModules: [] },
        };

        dataAccess.forEach((doc) => {
          if (doc.roleName && newMatrix[doc.roleName] !== undefined) {
            newMatrix[doc.roleName].modules = doc.moduleAccess?.map((item) => item.moduleName) || [];
            newMatrix[doc.roleName].subModules = doc.subModuleAccess?.map((item) => ({
              name: item.subModuleName,
              parentName: item.parentModuleName
            })) || [];
          }
        });

        setMatrix(newMatrix);
      }
    } catch (error) {
      console.error("Error loading matrix data:", error);
    } finally {
      if (!preserveLocalMatrix) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchModulesAndMatrix();
  }, []);

  const handleModuleCheckboxToggle = (moduleName, roleName) => {
    setMatrix((prev) => {
      const roleData = prev[roleName] || { modules: [], subModules: [] };
      const allowed = roleData.modules || [];
      const updatedModules = allowed.includes(moduleName)
        ? allowed.filter((item) => item !== moduleName)
        : [...allowed, moduleName];

      return {
        ...prev,
        [roleName]: {
          ...roleData,
          modules: updatedModules,
        },
      };
    });
  };

  const handleSubModuleCheckboxToggle = (subModuleName, parentModuleName, roleName) => {
    setMatrix((prev) => {
      const roleData = prev[roleName] || { modules: [], subModules: [] };
      const allowed = roleData.subModules || [];
      const exists = allowed.some((sub) => sub.name === subModuleName && sub.parentName === parentModuleName);

      const updatedSubModules = exists
        ? allowed.filter((sub) => !(sub.name === subModuleName && sub.parentName === parentModuleName))
        : [...allowed, { name: subModuleName, parentName: parentModuleName }];

      return {
        ...prev,
        [roleName]: {
          ...roleData,
          subModules: updatedSubModules,
        },
      };
    });
  };

  // Dynamically add new module or sub-module
  const handleAdd = async () => {
    if (!newModuleName.trim()) {
      alert("Please enter Name.");
      return;
    }

    if (creationType === "SUBMODULE" && !newModulePath.trim()) {
      alert("Please enter Route Path for the sub-module.");
      return;
    }

    if (creationType === "SUBMODULE" && !selectedParentId) {
      alert("Please select a Parent Module.");
      return;
    }

    try {
      setAdding(true);

      const endpoint = creationType === "MODULE" ? `${API_URL}/modules` : `${API_URL}/submodules`;
      const body = creationType === "MODULE" 
        ? {
            name: newModuleName.trim(),
            path: newModulePath.trim(),
            sortOrder: Number(sortOrder) || 0
          }
        : {
            name: newModuleName.trim(),
            path: newModulePath.trim(),
            parentModule: selectedParentId,
            sortOrder: Number(sortOrder) || 0
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create");
      }

      // Reset text inputs
      setNewModuleName("");
      setNewModulePath("");
      setSortOrder(0);

      // Re-fetch all modules & matrix to automatically show updates
      await fetchModulesAndMatrix(true);
      alert(`New ${creationType === "MODULE" ? "Module" : "Sub-module"} added dynamically!`);
    } catch (error) {
      console.error("Error creating item:", error);
      alert(error.message || "Failed to create.");
    } finally {
      setAdding(false);
    }
  };

  // Enter editing mode
  const handleEditClick = (item, type, parentName = "") => {
    setEditingItem({
      id: item._id,
      type: type, // "MODULE" or "SUBMODULE"
      name: item.name,
      path: item.path || "",
      sortOrder: item.sortOrder || 0,
      parentModule: item.parentModule?._id || item.parentModule || ""
    });
    // Smooth scroll to features form at the top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update existing module or sub-module
  const handleUpdate = async () => {
    if (!editingItem.name.trim()) {
      alert("Please enter Name.");
      return;
    }

    if (editingItem.type === "SUBMODULE" && !editingItem.path.trim()) {
      alert("Please enter Route Path for the sub-module.");
      return;
    }

    try {
      setAdding(true);

      const endpoint = editingItem.type === "MODULE" 
        ? `${API_URL}/modules/${editingItem.id}` 
        : `${API_URL}/submodules/${editingItem.id}`;
      
      const body = editingItem.type === "MODULE"
        ? {
            name: editingItem.name.trim(),
            path: editingItem.path.trim(),
            sortOrder: Number(editingItem.sortOrder) || 0
          }
        : {
            name: editingItem.name.trim(),
            path: editingItem.path.trim(),
            parentModule: editingItem.parentModule,
            sortOrder: Number(editingItem.sortOrder) || 0
          };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update");
      }

      setEditingItem(null);
      await fetchModulesAndMatrix(true);
      alert(`${editingItem.type === "MODULE" ? "Module" : "Sub-module"} updated successfully!`);
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.message || "Failed to update.");
    } finally {
      setAdding(false);
    }
  };

  // Delete existing module or sub-module
  const handleDelete = async (id, name, type) => {
    const confirmMessage = `Are you sure you want to delete the ${type.toLowerCase()} "${name}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const endpoint = type === "MODULE" ? `${API_URL}/modules/${id}` : `${API_URL}/submodules/${id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: getHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      await fetchModulesAndMatrix(true);
      alert(`${type === "MODULE" ? "Module" : "Sub-module"} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting:", error);
      alert(error.message || "Failed to delete.");
    }
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);

      // Save module & sub-module access for each role sequentially
      for (const roleName of roles) {
        const payload = {
          roleName,
          moduleAccess: matrix[roleName].modules.map((moduleName) => ({
            moduleName,
            permissions: { view: true, create: false, edit: false, delete: false },
          })),
          subModuleAccess: matrix[roleName].subModules.map((sub) => ({
            subModuleName: sub.name,
            parentModuleName: sub.parentName,
            permissions: { view: true, create: false, edit: false, delete: false },
          })),
        };

        const response = await fetch(`${API_URL}/role-access`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to save permissions for role: ${roleName}`);
        }
      }

      alert("Role Access Matrix saved successfully!");
    } catch (error) {
      console.error("Error saving matrix:", error);
      alert(error.message || "Failed to save role-module access settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: darkMode ? "#141821" : "#ffffff",
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* HEADER */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h5" fontWeight="bold">
            Menu Access
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage menus and role permissions.
          </Typography>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* DYNAMIC MODULE/SUBMODULE CREATION & EDITING FORM */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 2.5,
            border: `1px ${editingItem ? "solid" : "dashed"} ${editingItem ? (darkMode ? "#c6ff00" : "#1976d2") : borderColor}`,
            bgcolor: editingItem 
              ? (darkMode ? "rgba(198, 255, 0, 0.02)" : "rgba(25, 118, 210, 0.01)") 
              : (darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"),
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" color={editingItem ? (darkMode ? "#c6ff00" : "#1976d2") : textColor} gutterBottom>
            {editingItem ? "Edit Menu" : "Add Menu"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5 }}>
            Create menu or submenu items.
          </Typography>

          <Grid container spacing={2} alignItems="flex-end">
            {editingItem ? (
              // EDIT MODE INPUTS
              <>
                <Grid item xs={12} sm={2.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Menu Type</Typography>
                  <FormControl fullWidth size="small" disabled>
                    <Select value={editingItem.type}>
                      <MenuItem value="MODULE">Main Menu</MenuItem>
                      <MenuItem value="SUBMODULE">Sub Menu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {editingItem.type === "SUBMODULE" && (
                  <Grid item xs={12} sm={2.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Parent Menu</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editingItem.parentModule}
                        onChange={(e) => setEditingItem({ ...editingItem, parentModule: e.target.value })}
                        sx={{ color: textColor }}
                      >
                        {modules.map((m) => (
                          <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} sm={editingItem.type === "SUBMODULE" ? 2.5 : 4.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Menu Name</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Dashboard"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": { "& input": { color: textColor } }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={editingItem.type === "SUBMODULE" ? 2.5 : 3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Page Link</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. /dashboard"
                    value={editingItem.path}
                    onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": { "& input": { color: textColor } }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={1.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Order</Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: `1px solid ${borderColor}`, 
                      borderRadius: 1, 
                      height: '40px',
                      px: 0.5,
                      "&:hover": { borderColor: textColor }
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingItem({ ...editingItem, sortOrder: Math.max(0, editingItem.sortOrder - 1) })}
                      sx={{ color: textColor }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ color: textColor, fontWeight: 500, fontSize: '0.9rem' }}>
                      {editingItem.sortOrder}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingItem({ ...editingItem, sortOrder: editingItem.sortOrder + 1 })}
                      sx={{ color: textColor }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUpdate}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                      color: darkMode ? "#000" : "#fff",
                      "&:hover": { bgcolor: darkMode ? "#b2e600" : "#1565c0" }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setEditingItem(null)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: darkMode ? "#fff" : "#4b5563",
                      borderColor: borderColor,
                      "&:hover": { borderColor: textColor }
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </>
            ) : (
              // CREATION MODE INPUTS
              <>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Menu Type</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={creationType}
                      onChange={(e) => setCreationType(e.target.value)}
                      sx={{
                        color: textColor,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: borderColor },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: darkMode ? "#c6ff00" : "#1976d2" },
                      }}
                    >
                      <MenuItem value="MODULE">Main Menu</MenuItem>
                      <MenuItem value="SUBMODULE">Sub Menu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {creationType === "SUBMODULE" && (
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Parent Menu</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={selectedParentId}
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        displayEmpty
                        sx={{
                          color: textColor,
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: borderColor },
                        }}
                      >
                        <MenuItem value="" disabled>Select Parent Menu</MenuItem>
                        {modules.map((m) => (
                          <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} sm={creationType === "SUBMODULE" ? 2.5 : 4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Menu Name</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Video Editor"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: borderColor },
                        "& input": { color: textColor },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={creationType === "SUBMODULE" ? 2.5 : 3.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Page Link</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. /video-editor"
                    value={newModulePath}
                    onChange={(e) => setNewModulePath(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: borderColor },
                        "& input": { color: textColor },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={1.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.8, color: darkMode ? '#8a99ad' : 'text.secondary', fontSize: '0.85rem' }}>Order</Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: `1px solid ${borderColor}`, 
                      borderRadius: 1, 
                      height: '40px',
                      px: 0.5,
                      "&:hover": { borderColor: textColor }
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => setSortOrder(Math.max(0, sortOrder - 1))}
                      sx={{ color: textColor }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ color: textColor, fontWeight: 500, fontSize: '0.9rem' }}>
                      {sortOrder}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setSortOrder(sortOrder + 1)}
                      sx={{ color: textColor }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={2.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={adding}
                    onClick={handleAdd}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1,
                      bgcolor: darkMode ? "#c6ff00" : "#1976d2",
                      color: darkMode ? "#000" : "#fff",
                      "&:hover": {
                        bgcolor: darkMode ? "#b2e600" : "#1565c0",
                      },
                    }}
                  >
                    {adding ? "Creating..." : `Add ${creationType === "MODULE" ? "Main Menu" : "Sub Menu"}`}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {modules.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 6, fontStyle: "italic" }}>
            No modules found in the system. Use the form above to add your first module!
          </Typography>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <TableContainer
              sx={{
                display: { xs: "none", lg: "block" },
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                overflow: "hidden",
                mb: 4
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    bgcolor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Menu
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Link
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Order
                    </TableCell>
                    {roles.map((role) => {
                      const displayRole = role.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                      return (
                        <TableCell
                          key={role}
                          align="center"
                          sx={{ fontWeight: 700, fontSize: "0.90rem", color: textColor, px: 1 }}
                        >
                          {displayRole}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.95rem", color: textColor }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((module) => {
                    const isModChecked = {};
                    roles.forEach(role => {
                      isModChecked[role] = matrix[role]?.modules?.includes(module.name) || false;
                    });

                    return (
                      <React.Fragment key={module._id}>
                        {/* Parent Module Row */}
                        <TableRow
                          sx={{
                            bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                            "&:hover": {
                              bgcolor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                            },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, color: textColor }}>
                            📁 {module.name}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                            {module.path || "(Category Folder)"}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {module.sortOrder}
                          </TableCell>
                          {roles.map((role) => (
                            <TableCell key={role} align="center">
                              <Checkbox
                                checked={isModChecked[role]}
                                onChange={() => handleModuleCheckboxToggle(module.name, role)}
                                sx={{
                                  color: darkMode ? "#8a99ad" : "#1976d2",
                                  "&.Mui-checked": {
                                    color: darkMode ? "#c6ff00" : "#1976d2",
                                  },
                                }}
                              />
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                              <IconButton size="small" onClick={() => handleEditClick(module, "MODULE")} sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDelete(module._id, module.name, "MODULE")} sx={{ color: "#ef4444" }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Child Submodule Rows */}
                        {(module.subModules || []).map((sub) => {
                          const isSubChecked = {};
                          roles.forEach(role => {
                            isSubChecked[role] = matrix[role]?.subModules?.some(
                              (s) => s.name === sub.name && s.parentName === module.name
                            ) || false;
                          });

                          return (
                            <TableRow
                              key={sub._id}
                              sx={{
                                "&:hover": {
                                  bgcolor: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.005)",
                                },
                              }}
                            >
                              <TableCell sx={{ pl: 5, color: textColor, fontWeight: 500 }}>
                                ↳ 📄 {sub.name}
                              </TableCell>
                              <TableCell sx={{ color: "text.secondary", pl: 5, fontFamily: "monospace" }}>
                                {sub.path}
                              </TableCell>
                              <TableCell sx={{ color: "text.secondary", pl: 3 }}>
                                {sub.sortOrder}
                              </TableCell>
                              {roles.map((role) => (
                                <TableCell key={role} align="center">
                                  <Checkbox
                                    checked={isSubChecked[role]}
                                    onChange={() => handleSubModuleCheckboxToggle(sub.name, module.name, role)}
                                    sx={{
                                      color: darkMode ? "#8a99ad" : "#1976d2",
                                      "&.Mui-checked": {
                                        color: darkMode ? "#c6ff00" : "#1976d2",
                                      },
                                    }}
                                  />
                                </TableCell>
                              ))}
                              <TableCell align="center">
                                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleEditClick(sub, "SUBMODULE", module.name)} sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDelete(sub._id, sub.name, "SUBMODULE")} sx={{ color: "#ef4444" }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* MOBILE & TABLET MODULAR CARDS */}
            <Box
              sx={{
                display: { xs: "grid", lg: "none" },
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2.5,
              }}
            >
              {modules.map((module) => (
                <Card
                  key={module._id}
                  sx={{
                    bgcolor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 3,
                    boxShadow: "none",
                    p: 2.5,
                  }}
                >
                  {/* Parent Module Details */}
                  <Box sx={{ mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color={textColor}>
                        📁 {module.name} (order: {module.sortOrder})
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", display: "inline-block", mt: 0.5 }}>
                        {module.path || "(Category Folder)"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex" }}>
                      <IconButton size="small" onClick={() => handleEditClick(module, "MODULE")} sx={{ color: darkMode ? "#c6ff00" : "#1976d2" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(module._id, module.name, "MODULE")} sx={{ color: "#ef4444" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {roles.map((role) => {
                      const isChecked = matrix[role]?.modules?.includes(module.name) || false;
                      return (
                        <Grid item xs={6} key={role}>
                          <Box
                            onClick={() => handleModuleCheckboxToggle(module.name, role)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 0.5,
                              borderRadius: 1.5,
                              border: `1px solid ${isChecked ? (darkMode ? "#c6ff00" : "#1976d2") : borderColor}`,
                              bgcolor: isChecked 
                                ? (darkMode ? "rgba(198, 255, 0, 0.04)" : "rgba(25, 118, 210, 0.04)") 
                                : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              size="small"
                              sx={{
                                color: darkMode ? "#8a99ad" : "#1976d2",
                                "&.Mui-checked": { color: darkMode ? "#c6ff00" : "#1976d2" },
                                p: 0.5,
                                mr: 0.5
                              }}
                            />
                            <Typography variant="caption" fontWeight={600}>{role}</Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Submodules Lists nested in cards */}
                  {module.subModules && module.subModules.length > 0 && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${borderColor}` }}>
                      <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", display: "block", mb: 1 }}>
                        Sub-menus
                      </Typography>
                      {module.subModules.map((sub) => (
                        <Box key={sub._id} sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="caption" fontWeight={600}>
                              ↳ {sub.name} (order: {sub.sortOrder})
                            </Typography>
                            <Box sx={{ display: "flex" }}>
                              <IconButton size="small" onClick={() => handleEditClick(sub, "SUBMODULE", module.name)} sx={{ color: darkMode ? "#c6ff00" : "#1976d2", p: 0.25 }}>
                                <EditIcon sx={{ fontSize: "0.85rem" }} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDelete(sub._id, sub.name, "SUBMODULE")} sx={{ color: "#ef4444", p: 0.25 }}>
                                <DeleteIcon sx={{ fontSize: "0.85rem" }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", display: "block", mb: 0.5 }}>
                            {sub.path}
                          </Typography>

                          <Grid container spacing={0.5}>
                            {roles.map((role) => {
                              const isChecked = matrix[role]?.subModules?.some(
                                (s) => s.name === sub.name && s.parentName === module.name
                              ) || false;
                              return (
                                <Grid item xs={6} key={role}>
                                  <Box
                                    onClick={() => handleSubModuleCheckboxToggle(sub.name, module.name, role)}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      p: 0.25,
                                      borderRadius: 1,
                                      border: `1px solid ${isChecked ? (darkMode ? "#c6ff00" : "#1976d2") : borderColor}`,
                                      bgcolor: isChecked 
                                        ? (darkMode ? "rgba(198, 255, 0, 0.04)" : "rgba(25, 118, 210, 0.04)") 
                                        : "transparent",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      size="small"
                                      sx={{
                                        color: darkMode ? "#8a99ad" : "#1976d2",
                                        "&.Mui-checked": { color: darkMode ? "#c6ff00" : "#1976d2" },
                                        p: 0.25,
                                        mr: 0.25
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>{role}</Typography>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSaveMatrix}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: "8px",
              bgcolor: darkMode ? "#c6ff00" : "#1976d2",
              color: darkMode ? "#000" : "#fff",
              "&:hover": {
                bgcolor: darkMode ? "#b2e600" : "#1565c0",
              },
            }}
          >
            {saving ? "Saving Settings..." : "Save Access Settings"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RoleAccess;
