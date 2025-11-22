import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { getAdmin, getCurrentUser } from "../controllers/userController.js"
import { adminAuth } from "../middleware/adminAuth.js"



export const userRouter = express.Router()


userRouter.get('/getCurrentUser', isAuth, getCurrentUser)
userRouter.get('/getAdmin', adminAuth, getAdmin)