import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    defaultMeta: { service: "auth-service" },
    silent: Config.NODE_ENV === "test",
    transports: [
        new winston.transports.File({
            level: "debug",
            dirname: "logs",
            filename: "combined.log",
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "info.log",
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.Console({}),
    ],
});

export default logger;
