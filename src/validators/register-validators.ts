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
    firstName: {
        notEmpty: true,
        errorMessage: "First name is required",
        trim: true,
    },
    lastName: {
        notEmpty: true,
        errorMessage: "Last name is required",
        trim: true,
    },
    password: {
        notEmpty: true,
        errorMessage: "Password is required",
        trim: true,
        isLength: {
            options: { min: 8 },
            errorMessage: "Password must be at least 8 characters long",
        },
    },
});
