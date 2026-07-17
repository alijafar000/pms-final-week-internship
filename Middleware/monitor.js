import logger from "../utils/logger.js";

export const apiMonitor = (req, res, next) => {

    const start = Date.now();

    res.on("finish", () => {

        const responseTime = Date.now() - start;

        logger.info(
            `${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${responseTime} ms | IP: ${req.ip} | Agent: ${req.headers["user-agent"]}`
        );

    });
    next();
};