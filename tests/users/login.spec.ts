import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

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
        it("Should return the 200 status code", async () => {
            // Arrange
            const userData = {
                email: "john.doe@test.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert
            expect(response.status).toBe(200);
        });

        it("Should return valid json response", async () => {
            // Arrange
            const userData = {
                email: "john.doe@test.com",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert
            expect(response.header["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
    });
});
