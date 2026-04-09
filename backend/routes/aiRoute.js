import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  generateProductDescription,
  generateBlogDescription,
  summarizeProductDescription,
  analyzeProductDemand
} from '../services/aiService.js';
import Product from '../models/product.model.js';

export const aiRouter = express.Router();

// Generate product description (Admin only)
aiRouter.post('/generate-product-description', adminAuth, async (req, res) => {
  try {
    const { productName, category } = req.body;
    
    if (!productName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product name and category are required'
      });
    }

    const description = await generateProductDescription(productName, category);
    
    res.json({
      success: true,
      description
    });
  } catch (error) {
    console.error('Generate product description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate description'
    });
  }
});

// Generate blog description (Admin only)
aiRouter.post('/generate-blog-description', adminAuth, async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    const description = await generateBlogDescription(title, category);
    
    res.json({
      success: true,
      description
    });
  } catch (error) {
    console.error('Generate blog description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate description'
    });
  }
});

// Summarize product description (Public - for frontend)
aiRouter.post('/summarize-description', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const summary = await summarizeProductDescription(description);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Summarize description error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary'
    });
  }
});

// Analyze product demand (Admin only)
aiRouter.post('/analyze-demand', adminAuth, async (req, res) => {
  try {
    const products = await Product.find({});
    
    if (!products.length) {
      return res.status(400).json({
        success: false,
        message: 'No products found to analyze'
      });
    }

    const analysis = await analyzeProductDemand(products);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Analyze demand error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze demand'
    });
  }
});
