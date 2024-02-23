import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        // check if user already exists
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            const err = createHttpError(400, "User already exists!");
            throw err;
        }

        // hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CONSUMER || Roles.CREATOR,
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store data in the database",
            );
            throw err;
        }
    }
}
