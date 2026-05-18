import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { loginController, logoutController, signupController, } from '../controllers/authController.js'


const authRouter =express.Router()

authRouter.post('/register',signupController)
authRouter.post('/login',loginController)
authRouter.post('/logout',logoutController)

export default authRouter