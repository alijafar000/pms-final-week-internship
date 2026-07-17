import { Skill } from '../Models/Skill.js'
import { logActivity } from '../utils/activityLogger.js';
import logger from '../utils/logger.js';

//add Skill
export const addSkill = async (req, res, next) => {
    try {
        const start = Date.now();
        const { skillName, level } = req.body;

        if (!skillName || !level) return res.status(403).json({ message: "All fields are required...", success: false })

        let skill = await Skill.findOne({ user: req.user._id, skillName })
        if (skill) return res.json({ message: "Skill already added...", success: false })

        let savedSkill = await Skill.create({
            user: req.user._id, skillName, level
        })
        const end = Date.now();

        console.log(`Response Time : ${end - start} ms`);
        res.status(201).json({ message: "Skill added successfully...", savedSkill, success: true })
        logger.info(
            `${req.user.email} added skill ${skillName}`
        );
    } catch (error) {
        next(error)
    }
}

// //get skill
// export const getSkill = async (req, res) => {
//     const userSkill = await Skill.find({ user: req.user._id })

//     if (userSkill.length === 0) return res.json({ message: "No skill exists...", success: false })
//     res.json({ message: "Skill fetched...", userSkill, success: true })
// }

//get skill using pagination
export const getSkill = async (req, res, next) => {

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const totalSkills = await Skill.countDocuments({
            user: req.user._id
        });

        const userSkill = await Skill.find({
            user: req.user._id
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalSkills / limit),
            totalSkills,
            userSkill
        });
    } catch (error) {
        next(error);
    }
}

//update skill
export const updateSkill = async (req, res, next) => {
    try {
        const start = Date.now();
        const id = req.params.id;
        const { skillName, level } = req.body;

        let updatedSkill = await Skill.findOneAndUpdate({
            _id: id,
            user: req.user._id
        },
            { skillName, level },
            { new: true }
        )
        if (!updatedSkill) return res.status(404).json({ message: "No skill exist...", success: false })
        const end = Date.now();

        console.log(`Response Time : ${end - start} ms`);
        res.status(200).json({ message: "Skill update successfully...", updatedSkill, success: true })
        logger.info(
            `${req.user.email} updated skill ${updatedSkill.skillName}`
        );
    } catch (error) {
        next(error)
    }
}
//delete skill
export const deleteSkill = async (req, res, next) => {
    try {
        const id = req.params.id;

        let deletedSkill = await Skill.findOneAndDelete({
            _id: id,
            user: req.user._id
        }
        )
        if (!deletedSkill) return res.status(404).json({ message: "No skill exist...", success: false })
        //activity fn
        await logActivity(
            req.user._id,
            "Skill Deleted",
            deletedSkill.skillName
        );
        res.status(200).json({ message: "Skill delete successfully...", success: true })
        logger.info(
            `${req.user.email} deleted skill ${deletedSkill.skillName}`
        );
    } catch (error) {
        next(error)
    }

}