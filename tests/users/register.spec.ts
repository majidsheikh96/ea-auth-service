import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
    });
    describe("Fields are missing", () => {});
});
