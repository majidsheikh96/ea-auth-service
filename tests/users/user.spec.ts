import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => await connection.destroy());

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CONSUMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.status).toBe(200);
        });

        it("should return the user data", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "abc1@xyz.com",
                password: "password123",
            };

            // Register a user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CREATOR,
            });

            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            // Assert
            // Check if user it matches with registered  user
            expect(response.body.id).toBe(data.id);
        });

        it("should not return the password field", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "abc@xyz.com",
                password: "password123",
            };

            // Register a user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CREATOR,
            });

            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            // Assert
            // Check if user it matches with registered  user
            expect(response.body).not.toHaveProperty("password");
        });

        it("should return 401 status code if token does not exists", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "abc@xyz.com",
                password: "password123",
            };

            // Register a user
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CREATOR,
            });

            const response = await request(app).get("/auth/self").send();

            // Assert
            expect(response.statusCode).toBe(401);
        });
    });
});
