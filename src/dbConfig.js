import mongoose from "mongoose";

export const connectDB = () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URL);
    console.log("db connected");
  } catch (error) {
    console.log(error);
  }
};
