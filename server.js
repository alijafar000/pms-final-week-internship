import express from 'express'
import mongoose from 'mongoose';
import bodyParser from 'express'
import userRouter from './Routes/user.js'
import projectRouter from './Routes/project.js'
import portfolioRouter from './Routes/portfolio.js'
import skillRouter from './Routes/skill.js'
import dashboardRouter from './Routes/dashboard.js'
import adminRouter from './Routes/admin.js'
import activityRouter from './Routes/activity.js'
import swaggerUi from 'swagger-ui-express'
import { config } from 'dotenv';
import { apiLimiter } from './Middleware/rateLimiter.js';
import { errorMiddleware } from './Middleware/errorMiddleware.js';
import swaggerSpec from './Docs/swagger.js';
import logger from './utils/logger.js';
import helmet from "helmet";
import cors from "cors";
import { apiMonitor } from './Middleware/monitor.js';


const app = express();

app.use(helmet());

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Auth"]
    })
);

app.use(apiMonitor);

app.use(apiLimiter);

//parsing the body
app.use(bodyParser.json())

//.env setup
config({path:'.env'})

app.get('/', (req, res)=>{
    res.json({
        message: "Home route..."
    })
})

//user router
app.use('/api/user', userRouter);

//project router
app.use('/api/project', projectRouter)

//portfolio router
app.use('/api/portfolio', portfolioRouter)

//skill router
app.use('/api/skill', skillRouter)

//dashboard router
app.use('/api/dashboard', dashboardRouter)

//admin router
app.use('/api/admin', adminRouter)

//activity router
app.use("/api/activity", activityRouter)

//swagger UI
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

//errorMiddleware
app.use(errorMiddleware);

//connect mongodb
mongoose.connect(process.env.MONGO_URI, {
    dbName: "Codiora_House"
}).then(() => console.log("DB connected successfully")).catch((err) => console.log(err))
const port = process.env.PORT;

app.listen(port,()=>console.log(`Server is running on port ${port}`),
 logger.info(`Server started on port ${port}`)
)
