import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJWT } from "../utils";

describe("POST /auth/register", () => {
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
        it("Should return the 201 status code", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
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
                password: "secret12",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.header["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("Should persist the user in the databse", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };
            await request(app).post("/auth/register").send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toEqual(userData.firstName);
            expect(users[0].lastName).toEqual(userData.lastName);
            expect(users[0].email).toEqual(userData.email);
        });

        it("Should return an id of the created user", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            expect(response.body.id).toBeDefined();
            expect(typeof response.body.id).toBe("number");
        });

        it("should assign a customer role", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CONSUMER || Roles.CREATOR);
        });

        it("should store hased password in the database", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if email is already exists", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CONSUMER });

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "",
                password: "secret12",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if firstName is missing", async () => {
            const userData = {
                firstName: "",
                lastName: "Doe",
                email: " john.doe@test.com",
                password: "secret12",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if lastName is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "",
                email: " john.doe@test.com",
                password: "secret12",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: " john.doe@test.com",
                password: "",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret12",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

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

            expect(isJWT(accessToken as string)).toBeTruthy();
            expect(isJWT(refreshToken as string)).toBeTruthy();
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: " john.doe@test.com  ",
                password: "secret12",
            };

            await request(app).post("/auth/register").send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.email).toBe("john.doe@test.com");
        });

        it("should return 400 status code if email is not valid email", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doetest",
                password: "secret12",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password is less than 8 characters", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@test.com",
                password: "secret",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });
    });
});
