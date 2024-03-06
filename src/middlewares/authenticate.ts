import { expressjwt } from "express-jwt";
import jwksClient, { GetVerificationKey } from "jwks-rsa";
import { Request } from "express";
import { Config } from "../config";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];
            if (token) {
                return token;
            }
        }

        type AuthCookie = {
            accessToken: string;
        };

        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
