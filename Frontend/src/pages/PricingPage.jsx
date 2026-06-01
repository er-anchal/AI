import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import axios from "axios";

export default function Pricing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(`${apiBase}/subscription-plans`);
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 8 }, py: 6 }}>
        {/* HEADER */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h6"
            sx={{
              border: "1px solid black",
              borderRadius: "8px",
              display: "inline-block",
              px: 2,
              py: 0.5,
            }}
          >
            Flexible Plans for Everyone
          </Typography>

          <Typography variant="h2" fontWeight={900}>
            Pricing Plans
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Create studio-quality AI images & videos - at a fraction of
            traditional photoshoot cost
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/contact-us")}
            sx={{
              mt: 3,
              px: 4,
              py: 1.3,
              borderRadius: 3,
              fontWeight: 600,
            }}
          >
            Contact Sales
          </Button>
        </Box>
        {/* PRICING CARDS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)"
            },
            gap: 3,
            justifyContent: "center",
            width: "100%",
            maxWidth: "1200px",
            mx: "auto"
          }}
        >
          {loading ? (
            <Typography mt={4}>Loading plans...</Typography>
          ) : plans.length === 0 ? (
            <Typography mt={4}>No plans available at the moment.</Typography>
          ) : (
            plans.map((plan, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  minWidth: 0
                }}
              >
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    border: plan.recommended ? "2px solid #1976d2" : "1px solid #ddd",
                    boxShadow: plan.recommended
                      ? "0 0 0 3px rgba(25,118,210,0.15)"
                      : "none",
                    position: "relative",
                    overflow: "visible",
                    transition: "0.3s ease",
                    "&:hover": {
                      border: plan.recommended ? "2px solid #1565c0" : "1px solid black",
                      transform: "translateY(-6px)",
                      boxShadow: plan.recommended
                        ? "0 0 0 3px rgba(25,118,210,0.3), 0 12px 32px rgba(25,118,210,0.15)"
                        : "0 10px 30px rgba(0,0,0,0.08)",
                    },
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

                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 3,
                      "&:last-child": { pb: 3 }
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, textAlign: "left" }}>
                      {plan.title}
                    </Typography>

                    <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5, mb: 1, textAlign: "left" }}>
                      {plan.subtitle}
                    </Typography>

                    <Typography variant="h4" fontWeight={900} sx={{ mt: 1.5, mb: 2.5, textAlign: "left", color: plan.recommended ? "#1976d2" : "inherit" }}>
                      {plan.price}
                    </Typography>

                    {/* Checklist features styling with green checkmarks */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.2, wordBreak: "break-word" }}>
                      {plan.features.map((f, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                          <CheckIcon sx={{ color: plan.recommended ? "#1976d2" : "success.main", fontSize: 16, mt: 0.3 }} />
                          <Typography fontSize={13.5} color="text.primary" sx={{ textAlign: "left", lineHeight: 1.3 }}>
                            {f}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ mt: "auto", pt: "30px" }}>
                      <Button
                        fullWidth
                        variant={plan.recommended ? "contained" : "outlined"}
                        sx={{
                          py: 1.2,
                          borderRadius: "10px",
                          fontWeight: 700,
                          textTransform: "none",
                          fontSize: 13.5,
                          ...(plan.recommended && {
                            bgcolor: "#1976d2",
                            color: "#fff",
                            "&:hover": { bgcolor: "#1565c0" },
                          }),
                        }}
                        onClick={() =>
                          plan.title === "Enterprise Plan"
                            ? navigate("/contact-us")
                            : navigate("/login")
                        }
                      >
                        {plan.title === "Enterprise Plan"
                          ? "Contact Sales"
                          : "Get Started"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )))}
        </Box>

        {/* COST COMPARISON */}
        <Box sx={{ px: { xs: 2, md: 10 }, py: 6 }}>
          <Typography variant="h2" fontWeight={700} textAlign="center">
            Cost Comparison
          </Typography>
          <Typography color="text.secondary" mt={1} textAlign="center">
            See how much you save by switching from traditional photoshoots.
          </Typography>
          <Grid container spacing={4} mt={2} justifyContent="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: "#fff3f3",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Typography fontWeight={700}>Traditional Photoshoot</Typography>
                <Typography mt={1}>• Studio cost</Typography>
                <Typography>• Photographer charges</Typography>
                <Typography>• Models required</Typography>
                <Typography>• Days of work</Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: "#f3fff5",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Typography fontWeight={700}>
                  AI Product Shoot (EKODEX)
                </Typography>
                <Typography mt={1}>• Instant generation</Typography>
                <Typography>• No studio required</Typography>
                <Typography>• No models needed</Typography>
                <Typography>• 90% cost saving</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
