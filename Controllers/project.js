import { Project } from "../Models/Project.js";
import { logActivity } from "../utils/activityLogger.js";
import logger from "../utils/logger.js";

//add new project
export const addProject = async (req, res, next) => {
    try {
        const start = Date.now();
        const { projectName, description, technologiesUsed, category, status } = req.body;

        if (projectName == "" || description == "" || technologiesUsed == "" || category == "") return res.status(400).json({
            message: "All fields are required...",
            success: false
        })

        let project = await Project.findOne({ projectName, user: req.user._id });

        if (project) return res.status(400).json({
            message: "Project already added...",
            success: false
        })

        let savedProject = await Project.create({
            user: req.user._id, projectName, description, technologiesUsed, category, status
        })
        //activity fn
        await logActivity(
            req.user._id,
            "Project Added",
            projectName
        );
        const end = Date.now();
        console.log(`Response Time : ${end - start} ms`);

        res.status(201).json({
            message: "Project add successfully...",
            savedProject,
            success: true
        })
        logger.info(
            `${req.user.email} added project ${projectName}`
        );
    } catch (error) {
        next(error)
    }

}

//get project using pagination
export const getAllProject = async (req, res) => {
    const start = Date.now();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const totalProjects = await Project.countDocuments({
        user: req.user._id
    });

    const userProject = await Project.find({
        user: req.user._id
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

    const end = Date.now();
    console.log(`Response Time : ${end - start} ms`);

    res.json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / limit),
        totalProjects,
        userProject
    });
}

//get project by id
export const getProjectById = async (req, res) => {
    const id = req.params.id;

    const userProject = await Project.findOne({ _id: id, user: req.user._id }).lean();
    if (!userProject) return res.status(404).json({ message: "No project exists...", success: false })

    res.status(200).json({ message: "Project Fetched", userProject, success: true })
}

//update project 
export const updateProject = async (req, res, next) => {
    try {
        const start = Date.now();
        const id = req.params.id;

        const { projectName, description, technologiesUsed, category } = req.body;

        let updatedProject = await Project.findOneAndUpdate({
            _id: id,
            user: req.user._id
        },
            {
                projectName,
                description,
                technologiesUsed,
                category
            }, { new: true });

        if (!updatedProject) return res.status(404).json({
            message: "No project exists...",
            success: false
        })
        //activity fn
        await logActivity(
            req.user._id,
            "Project Updated",
            updatedProject.projectName
        );
        const end = Date.now();
        console.log(`Response Time : ${end - start} ms`);

        res.status(200).json({
            message: "Project update successfully...",
            updatedProject,
            success: true
        })
        logger.info(
            `${req.user.email} updated project ${updatedProject.projectName}`
        );
    } catch (error) {
        next(error)
    }
}

//delete project
export const deleteProject = async (req, res, next) => {
    try {
        const start = Date.now();
        const id = req.params.id;

        let deletedProject = await Project.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!deletedProject) return res.status(404).json({
            message: "No project exists...",
            success: false
        });

        //activity fn
        await logActivity(
            req.user._id,
            "Project Deleted",
            deletedProject.projectName
        );
        const end = Date.now();
        console.log(`Response Time : ${end - start} ms`);

        res.status(200).json({
            message: "Project delete successfully...",
            success: true
        });
        logger.info(
            `${req.user.email} deleted project ${deletedProject.projectName}`
        );
    } catch (error) {
        next(error)
    }
}
// Adv search project
export const searchProject = async (req, res, next) => {

    try {
        const {
            keyword,
            category,
            technology,
            status,
            page = 1,
            limit = 5,
            sort = "new"
        } = req.query;

        let query = {
            user: req.user._id
        };

        // Keyword Search
        if (keyword) {
            query.projectName = {
                $regex: keyword,
                $options: "i"
            };
        }

        // Category
        if (category) {
            query.category = category;
        }

        // Technology
        if (technology) {
            query.technologiesUsed = {
                $in: [technology]
            };
        }

        // Status
        if (status) {
            query.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const totalProjects = await Project.countDocuments(query);

        const projects = await Project.find(query)
            .sort({
                createdAt: sort === "old" ? 1 : -1
            })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            totalProjects,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProjects / limit),
            projects
        });
    } catch (error) {
        next(error)
    }

};

//uploading project image
export const uploadProjectImage = async (req, res) => {

    const id = req.params.id;

    const project = await Project.findOne({
        _id: id,
        user: req.user._id
    });

    if (!project) {
        return res.status(404).json({
            message: "Project not found",
            success: false
        });
    }

    project.projectImage = req.file.path;

    await project.save();
    logger.info(
        `${req.user.email} uploaded image for ${project.projectName}`
    );

    res.status(200).json({
        message: "Project image uploaded",
        image: project.projectImage,
        success: true
    });
}
