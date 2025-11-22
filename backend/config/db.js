import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log("Database connected successfully!")
  } catch (error) {
    console.log("Database connection failed!")
    process.exit(1)
  }
}