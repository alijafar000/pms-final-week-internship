import express from 'express'
import { addProject, deleteProject, getAllProject, getProjectById, searchProject, updateProject } from '../Controllers/project.js';
import { isAuthenticate } from '../Middleware/Auth.js';
import { upload } from '../Middleware/Upload.js';
import { uploadProjectImage } from '../Controllers/project.js';
import { projectValidation } from '../Middleware/Validator.js';

const router = express.Router();

/**
 * @swagger
 * /api/project/new:
 *   post:
 *     summary: Add New Project
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - description
 *               - technologiesUsed
 *               - category
 *             properties:
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               technologiesUsed:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: Completed
 *     responses:
 *       201:
 *         description: Project added successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/new', isAuthenticate, projectValidation, addProject);

//search project 
/**
 * @swagger
 * /api/project/search:
 *   get:
 *     summary: Search and Filter Projects
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: technology
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 */
router.get("/search", isAuthenticate, searchProject);

//filter project
// router.get("/filter", isAuthenticate, filterProjects);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Get All Projects
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 */
router.get('/', isAuthenticate, getAllProject)


//get project by id
/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Get Project By ID
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       404:
 *         description: Project not found
 */
router.get('/:id', isAuthenticate, getProjectById)


//update project
/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Update Project
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               technologiesUsed:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 */
router.put('/:id', isAuthenticate, projectValidation, updateProject);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Delete Project
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete('/:id', isAuthenticate, deleteProject);

//upload project image
/**
 * @swagger
 * /api/project/upload-image/{id}:
 *   put:
 *     summary: Upload Project Image
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectImage
 *             properties:
 *               projectImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Project image uploaded successfully
 *       404:
 *         description: Project not found
 */
router.put("/upload-image/:id", isAuthenticate,
   upload.single("projectImage"),
   uploadProjectImage
);
export default router;