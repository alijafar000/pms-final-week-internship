import { Portfolio } from '../Models/Portfolio.js'
import { logActivity } from '../utils/activityLogger.js';
import logger from '../utils/logger.js';

//add portfolio
export const addPortfolio = async (req, res, next) => {
    try {
        const start = Date.now();
        const { fullName, email, about, phone, socialLinks } = req.body;

        if (!fullName || !email || !about || !phone || !socialLinks) return res.status(403).json({
            message: "All fields are required...",
            success: false
        })

        let portfolio = await Portfolio.findOne({ user: req.user._id })
        if (portfolio) return res.status(400).json({
            message: "Portfolio already added...",
            success: false
        })

        let savedPortfolio = await Portfolio.create({
            user: req.user._id, fullName, email, about, phone, socialLinks
        })
        const end = Date.now();

        console.log(`Response Time : ${end - start} ms`);
        res.status(201).json({ message: "Portfolio added successfully...", savedPortfolio, success: true })
        logger.info(
            `${req.user.email} created portfolio`
        );
    } catch (error) {
        next(error)
    }
}

//get portfolio
export const getPortfolio = async (req, res, next) => {
    try {
        const userPortfolio = await Portfolio.findOne({ user: req.user._id }).lean();

        if (!userPortfolio) return res.status(404).json({
            message: "No portfolio exists...",
            success: false
        })
        res.status(200).json({ message: "Portfolio fetched...", userPortfolio, success: true })
    } catch (error) {
        next(error)
    }
}

//update portfolio
export const updatePortfolio = async (req, res, next) => {
    // const id = req.params.id;
    try {
        const start = Date.now();
        const { fullName, email, about, phone, socialLinks } = req.body;

        let updatedPortfolio = await Portfolio.findOneAndUpdate({
            user: req.user._id
        },
            {
                fullName,
                email,
                about,
                phone,
                socialLinks
            }, { new: true }
        )
        if (!updatedPortfolio) return res.status(404).json({ message: "No portfolio exists...", success: false })
        //activity fn
        await logActivity(
            req.user._id,
            "Portfolio Updated",
            req.user.name
        );
        const end = Date.now();

        console.log(`Response Time : ${end - start} ms`);
        res.status(200).json({ message: "Portfolio updated successfully...", updatedPortfolio, success: true })
        logger.info(
            `${req.user.email} updated portfolio`
        );

    } catch (error) {
        next(error)
    }
}