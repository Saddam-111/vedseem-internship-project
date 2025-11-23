import express from 'express'
import dotenv from 'dotenv'
import { dbConnect } from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/authRoute.js';
import { userRouter } from './routes/userRoute.js';
import { blogRouter } from './routes/blogRoute.js';
import { productRouter } from './routes/productRoute.js';
import { cartRouter } from './routes/cartRoute.js';
import { orderRouter } from './routes/orderRoute.js';
import { adminRouter } from './routes/adminRoute.js';
import { reviewRouter } from "./routes/review.routes.js";
import { locationRouter } from './routes/geocodeRoute.js';
dotenv.config()


const app = express()
const port = process.env.PORT;
app.set("trust proxy", 1);


const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: "Too may requests from this IP, please try again later."
})


//middleware
//app.use(limiter)
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://vedseem-internship-project.vercel.app",
    "https://vedseem-internship-project-admin.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
}))

//database connection
await dbConnect()

app.get('/', (req, res) => {
  res.send("Server is working")
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/blogs', blogRouter)
app.use('/api/v1/product', productRouter)
app.use("/api/v1/cart", cartRouter);

app.use("/api/v1/order", orderRouter);
app.use('/api/v1/admindata', adminRouter)
app.use('/api/v1/location', locationRouter)
app.use("/api/v1/review", reviewRouter);





app.listen(port, () => {
  console.log("Server is listening on port:", port)
})