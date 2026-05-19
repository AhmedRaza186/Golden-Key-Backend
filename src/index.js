import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import postRoutes from './routes/postRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import dns from 'node:dns' 
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

dns.setServers(['8.8.8.8', '1.1.1.1'])

const clientUrl = process.env.CLIENT_URL || "http://localhost:5174"
const allowedOrigins = [
  clientUrl,
  clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl + '/'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/posts', postRoutes)
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is working fine' })
})

if (!process.env.PRODUCTION) {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
    return
  })
}

export default app;