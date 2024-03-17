import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { isJwt } from "../utils";
import bcrypt from "bcryptjs";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => await connection.destroy());

    describe("Given all fields", () => {
        it("should return the access token and refresh token inside a cookie", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CONSUMER,
            });

            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });
            let accessToken;
            let refreshToken;

            const cookies = response.headers["set-cookie"] || [];
            for (const cookie of cookies) {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            }

            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            // Assuming you have a function to validate JWTs
            expect(isJwt(accessToken as string)).toBeTruthy();
            expect(isJwt(refreshToken as string)).toBeTruthy();
        });

        it("should return a 400 status code for incorrect email or password", async () => {
            const userData = {
                email: "john.doe@test.com",
                password: "secret12",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CONSUMER,
            });

            // Test with incorrect email
            const invalidEmailResponse = await request(app)
                .post("/auth/login")
                .send({ ...userData, email: "invalid@email.com" });
            expect(invalidEmailResponse.status).toBe(400);

            // Test with incorrect password
            const invalidPasswordResponse = await request(app)
                .post("/auth/login")
                .send({ ...userData, password: "wrong_password" });
            expect(invalidPasswordResponse.status).toBe(400);
        });
    });
});
