import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MyFlipbooks({ isTab }) {
  const [flipbooks, setFlipbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFlipbooks();
  }, []);

  const fetchFlipbooks = async () => {
    if (!token) return navigate("/login");

    try {
      const res = await axios.get(`${API_URL}/flipbooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.length > 0) {
        // console.log(res.data[0]);
        setFlipbooks(res.data);
      } else {
        setFlipbooks([]);
      }
    } catch (error) {
      console.error("Failed to load designs", error);
      alert(error.response?.data?.message || "Failed to load designs ❌");
      setFlipbooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isTab ? 0 : 4 }}>
      {!isTab && (
        <Typography variant="h5" mb={3} fontWeight={700} textAlign={"center"}>
          My Magazines
        </Typography>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : flipbooks.length === 0 ? (
        <Typography color="text.secondary">
          No magazines created yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {flipbooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.03)" },
                }}
                onClick={() => navigate(`/magazines/${book._id}`)}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={
                    book.type === "pdf"
                      ? book.coverImage
                      : book.coverDesignId?.thumbnail
                  }
                  alt={"Magazine"}
                  sx={{ objectFit: "contain", bgcolor: "#f5f5f5" }}
                />

                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </Typography>
                  {book.type === "pdf" ? (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      PDF Magazine
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Image Magazine
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
