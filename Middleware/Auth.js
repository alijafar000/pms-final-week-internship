import jwt from "jsonwebtoken";
import { User } from "../Models/User.js";

export const isAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Login first...",
                success: false,
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token...",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found!",
                success: false,
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or Expired Token",
            success: false,
        });
    }
};