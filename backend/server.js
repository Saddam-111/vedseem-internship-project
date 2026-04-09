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
import { aiRouter } from './routes/aiRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
dotenv.config()


const app = express()
const port = process.env.PORT || 4000;
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again later."
})
app.use("/api/", limiter)

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:4000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:4000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://vedseem-internship-project.vercel.app",
      "https://vedseem-internship-project-admin.vercel.app"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin starts with vercel.app for frontend/admin
    if (origin.endsWith('.vercel.app') || origin.includes('vercel')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}
app.use(cors(corsOptions))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

await dbConnect()

app.get('/', (req, res) => {
  res.send("Server is working")
})

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
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
app.use('/api/v1/ai', aiRouter);

// Socket.io for real-time updates
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175",
      "https://vedseem-internship-project.vercel.app",
      "https://vedseem-internship-project-admin.vercel.app"
    ],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined real-time room');
  });
  
  socket.on('join-user', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
      }
    });
  });
});

// Make io accessible in routes
app.set('io', io);

export { io };

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Something went wrong' 
      : message
  });
});

app.listen(port, () => {
  console.log("Server is listening on port:", port)
})

// For Socket.io, use httpServer instead
httpServer.listen(port + 1, () => {
  console.log("Socket.io server running on port:", port + 1)
})