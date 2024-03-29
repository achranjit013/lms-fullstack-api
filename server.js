import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./src/config/dbConfig.js";

const app = express();

// port set up
const PORT = process.env.PORT || 8000;

// db connect
connectDB();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// api endpoints
import userRouter from "./src/routers/userRouter.js";
import bookRouter from "./src/routers/bookRouter.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

// basic setup
app.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "server is running well...",
  });
});

app.use("*", (req, res, next) => {
  const error = {
    message: "404 page not found!",
    errorCode: 404,
  };

  next(error);
});

// error handler
app.use((error, req, res, next) => {
  const errorCode = error.errorCode || 500;
  res.status(errorCode).json({
    status: "error",
    message: error.message,
  });

  next(error);
});

// listen to port
app.listen(PORT, (error) => {
  error
    ? console.log(error.message)
    : console.log(`server is running at: http://localhost:${PORT}`);
});
