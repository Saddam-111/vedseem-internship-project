import express from "express"
import { isAuth } from "../middleware/isAuth.js"
import { getAdmin, getCurrentUser, updateAdmin } from "../controllers/userController.js"
import { adminAuth } from "../middleware/adminAuth.js"

export const userRouter = express.Router()

userRouter.get('/getCurrentUser', isAuth, getCurrentUser)
userRouter.get('/getAdmin', adminAuth, getAdmin)
userRouter.put('/updateAdmin', adminAuth, updateAdmin)