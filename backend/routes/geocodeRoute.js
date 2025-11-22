import express from 'express'
import { getGeocode } from '../controllers/geocode.controllers.js'
import { isAuth } from '../middleware/isAuth.js'

export const locationRouter = express.Router()

locationRouter.get('/geocode', isAuth,getGeocode)