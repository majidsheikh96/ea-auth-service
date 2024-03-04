import { checkSchema } from "express-validator";

// export default [
//     body("email")
//         .notEmpty()
//         .withMessage("Email is required")
//         .isEmail()
//         .withMessage("Invalid email format"),
// ];

export default checkSchema({
    email: {
        notEmpty: true,
        errorMessage: "Email is required",
        trim: true,
        isEmail: {
            errorMessage: "Invalid email format",
        },
    },
    password: {
        notEmpty: true,
        errorMessage: "Password is required",
    },
});
