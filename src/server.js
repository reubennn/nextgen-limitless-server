/** dotenv config setup for loading secret environment variables */
import "../config/loadEnv";

import express from "express";
import path from "path";
/** Express Server security */
import helmet from "helmet";
import hpp from "hpp";
import csrf from "csurf";
import cors from "cors";
import rateLimit from "express-rate-limit";

import articleRouter from "./api/article.routes";
import commentRouter from "./api/comment.routes";
import emailRouter from "./api/email.routes";

const PORT = process.env.PORT || 9000;
const PUBLIC_PATH = process.env.NODE_ENV === "development" ?
    "../public" : "./public";

/** Set up the Express.js app */
const app = express();

/** Helmet helps to secure Express server by setting various HTTP headers. */
app.use(helmet());

/** Use hpp as middleware to protect against HTTP Parameter Pollution attacks */
app.use(hpp());

/** Protect against Cross-Site Request Forgery (CSRF) */
// app.use(csrf({ cookie: true }));

/** Enable CORS from client origins */
app.use(cors({
    origin: [
        process.env.CLIENT_ORIGIN_URL,
        process.env.CLIENT_ORIGIN_URL_WWW,
    ],
}));

/** Set up the Express Rate Limiter for the API */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
});

/** Apply the Express Rate Limiter to the /api endpoint. */
app.use("/api", apiLimiter);

/**
 * Parse JSON objects included in requests.
 * - Adds body property to the req parameter to the matching route.
 */
app.use(express.json());

/** Serve static files on Express server using middleware */
app.use(express.static(path.join(__dirname, PUBLIC_PATH)));

/** Use API router as middleware with endpoint "/api" */
app.use("/api", articleRouter);
app.use("/api", commentRouter);
app.use("/api", emailRouter);

/**
 * All requests which are not caught by the other API routes should be
 * passed onto the app.
 * - Allows the client side app to navigate between pages and process
 * URLs correctly.
 */
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, `${PUBLIC_PATH}/index.html`));
});

/** Bind Express app and listen for connections */
const server = app.listen(PORT, () => {
    console.log(`\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\
    \nServer listening on PORT ${PORT}.\
    \n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`);
});

/* Close the server before Node.js exits */
process.on("exit", () => {
    server.close();
});
