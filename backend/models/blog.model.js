
// models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    image: {
    url: { type: String },
    publicId: { type: String },
  },
    category: {
      type: String,
      enum: ['birthday', 'anniversary', 'congratulation', 'rakhi special', 'gifting'],
      required: true,
    },
    createdAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;

