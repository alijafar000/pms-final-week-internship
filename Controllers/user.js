import { User } from "../Models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { logActivity } from "../utils/activityLogger.js";
import logger from "../utils/logger.js";

//user register
export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (name == "" || email == "" || password == "") return res.status(400).json({
            message: "All fields are required..."
        })

        let user = await User.findOne({ email });

        if (user) return res.json({
            message: "User alredy registered...",
            success: false
        })

        let hashPassword = await bcrypt.hash(password, 10);

        user = await User.create({ name, email, password: hashPassword, role: role || "user" });
        res.status(201).json({
            message: "User created successfully...",
            success: true,
            user: user
        }),
            logger.info(
                `${user.email} registered successfully`
            );
    } catch (error) {
        next(error);
    }
}

//user login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (email == "" || password == "") return res.status(400).json({
            message: "All fields are required...",
            success: false
        })

        //finding user email from db
        const user = await User.findOne({ email });

        if (!user) {
             logger.warn(`Login failed - User not found: ${email}`);
                return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.warn(`Failed login attempt for ${email}`);
                return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT,
            { expiresIn: "7d" }
        );
        logger.info(
            `${user.email} logged in`
        );
        //activity fn
        await logActivity(
            user._id,
            "User Login",
            `${user.name} logged in`
        );

        res.status(200).json({
            message: `Welcome ${user.name}`,
            token,
            role: user.role,
            success: true
        })
    } catch (error) {
        next(error);
    }
}

//profile image upload
export const uploadProfileImage = async (req, res) => {

    const user = await User.findById(req.user._id);

    user.profileImage = req.file.path;

    await user.save();
    logger.info(
        `${req.user.email} uploaded profile image`
    );

    res.status(200).json({
        message: "Profile image uploaded",
        image: user.profileImage,
        success: true
    });
}