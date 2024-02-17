import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await truncateTables(connection);
    });

    afterAll(async () => await connection.destroy());

    describe("Given all fields", () => {
        it("Should return the 201 status code", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.status).toBe(201);
        });

        it("Should return valid json response", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.header["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("Should persist the user in the databse", async () => {
            // Arrage
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret",
            };
            // Act
            await request(app).post("/auth/register").send(userData);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toEqual(userData.firstName);
            expect(users[0].lastName).toEqual(userData.lastName);
            expect(users[0].email).toEqual(userData.email);
        });
    });
    describe("Fields are missing", () => {});
});
