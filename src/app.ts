import express from "express";

const app = express();

app.get("/", (_, res) => {
    return res.json({
        message: "Hello from auth service",
    });
});

export default app;
