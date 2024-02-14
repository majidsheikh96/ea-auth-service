import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: { service: "auth-service" },
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
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],
});

export default logger;
