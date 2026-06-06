import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ZodError, ZodIssue } from "zod";
import authRouter from "./modules/auth/auth.router.js";

const app = express();

// Configure CORS to support cookie credentials
app.use(
  cors({
    origin: true, // Allow all origins for dev/testing, but support credentials
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "VendorBridge API Running",
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  // If it's a validation error, format it nicely
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((e: ZodIssue) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  console.error("[Error Handler]", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;