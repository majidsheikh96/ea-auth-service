import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import "reflect-metadata";

const app = express();
app.use(express.json());
app.get("/", async (_, res) => {
    return res.json({
        message: "Hello from auth service",
    });
});

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        errors: [
            {
                type: error.name,
                message: error.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
