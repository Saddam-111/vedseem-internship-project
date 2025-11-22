import express from 'express'
import { adminLogin, googleLogin, login, logout, register, resetPassword, sendOtp, verifyOtp } from '../controllers/auth.controllers.js'




export const authRouter = express.Router()

authRouter.post('/googleLogin', googleLogin)

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.post('/adminLogin', adminLogin)

authRouter.post('/sendOtp', sendOtp)
authRouter.post('/resetPassword', resetPassword)
authRouter.post('/verifyOtp', verifyOtp)