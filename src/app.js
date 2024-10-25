import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_VERSION } from "./constants.js";

const app = express();

// config cores,json,cookieParser,etc
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import followingRouter from "./routes/following.routes.js";
import commentRouter from "./routes/comment.routes.js";

// routes declaration
app.use(`${API_VERSION}/healthCheck`, healthCheckRouter);
app.use(`${API_VERSION}/users`, userRouter);
app.use(`${API_VERSION}/posts`, postRouter);
app.use(`${API_VERSION}/follow-relationships`, followingRouter);
app.use(`${API_VERSION}/comments`, commentRouter);

export { app };
