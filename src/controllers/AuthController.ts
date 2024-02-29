import path from "path";
import fs from "fs";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";

export class AuthController {
    userService: UserService;
    constructor(
        userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }

        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "*******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info("User has been registered", { id: user.id });

            let privateKey;

            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (err) {
                const error = createHttpError(500, "Private key not found");
                return next(error);
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = sign(payload, privateKey, {
                expiresIn: "1h",
                algorithm: "RS256",
                issuer: "auth-serivce",
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                expiresIn: "1y",
                algorithm: "HS256",
                issuer: "auth-serivce",
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
                maxAge: 1000 * 60 * 60, // 1h
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
