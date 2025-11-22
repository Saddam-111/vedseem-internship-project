import { deleteCloudinary, uploadCloudinary } from '../config/cloudinary.js';
import Blog from '../models/blog.model.js';

export const addBlogs = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let image = null;

    if (req.file) {  // <-- change here
      const result = await uploadCloudinary(req.file.path, "blogs");

      if (result && result.secure_url && result.public_id) {
        image = {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
        });
      }
    }

    // Check if all required fields are provided
    if (!title || !description || !image || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create a new blog document
    const newBlog = new Blog({
      title,
      description,
      image,
      category,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog added successfully!",
      blog: newBlog,
    });
  } catch (error) {
    console.log("Failed in add Blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add the blog",
    });
  }
};



// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await deleteCloudinary(blog.publicId)

    // Delete the blog from the database
    await blog.remove();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    console.log("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Update fields
    if (req.body.title !== undefined) blog.title = req.body.title;
    if (req.body.description !== undefined) blog.description = req.body.description;
    if (req.body.category !== undefined) blog.category = req.body.category;

    // If new image uploaded, replace Cloudinary image
    if (req.file) {
      if (blog.image?.publicId) {
        await deleteCloudinary(blog.image.publicId);
      }

      const uploaded = await uploadCloudinary(req.file.path, "blogs");
      blog.image = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog,
    });
  } catch (error) {
    console.log("Failed to update Blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update the blog",
    });
  }
};





export const listAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    // Convert to numbers
    const pageNumber = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    // Skip and limit logic for pagination
    const skip = (pageNumber - 1) * pageLimit;

    // Get all blogs with pagination
    const blogs = await Blog.find()
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 }); // Sort blogs by creation date (most recent first)

    // Get the total count of blogs for pagination
    const totalBlogs = await Blog.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
      totalBlogs,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBlogs / pageLimit),
    });
  } catch (error) {
    console.log("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};