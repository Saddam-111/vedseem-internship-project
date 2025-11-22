import express from 'express'
import { adminAuth } from '../middleware/adminAuth.js';
import { getDashboardStats, getRevenueByMonth } from '../controllers/admin.controllers.js';

export const adminRouter = express.Router()


adminRouter.get("/stats", adminAuth, getDashboardStats);
adminRouter.get("/revenue", adminAuth, getRevenueByMonth);


