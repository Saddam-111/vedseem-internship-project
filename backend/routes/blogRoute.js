import express from 'express'
import { adminAuth } from '../middleware/adminAuth.js'
import { addBlogs, deleteBlog, listAllBlogs, updateBlog } from '../controllers/blog.controllers.js'
import { upload } from '../middleware/multer.js'

export const blogRouter = express.Router()



blogRouter.post('/add',upload.single("image"), adminAuth, addBlogs)
blogRouter.post('/delete/:id', adminAuth, deleteBlog)
blogRouter.get('/list', listAllBlogs)
blogRouter.put('/update/:id', upload.single("image"), adminAuth, updateBlog);
