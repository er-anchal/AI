import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useThemeContext } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { darkMode, borderColor } = useThemeContext();

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          bgcolor: darkMode ? "#141821" : "#ffffff",
          border: `1px solid ${borderColor}`,
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Coming Soon...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 500 }}>
          This page is currently under development. Soon you'll be able to see key metrics, analytics, and quick actions here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
