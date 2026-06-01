import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    // Set DNS servers to Google's public DNS to resolve SRV record issues on Windows/certain routers
    dns.setServers(["8.8.8.8"]);
    
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
