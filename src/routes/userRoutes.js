import express from 'express'

import { verifyToken } from '../utils/verifyToken.js';
import {
  getLogginedInUserController,
  deleteUserController,
  updateUserController,
  getUsersController,
  savePost,
  profilePosts,
  getNotificationNumber
} from "../controllers/userController.js";
const userRouter = express.Router()


userRouter.get('/currentUser', verifyToken, getLogginedInUserController);

userRouter.get("/", verifyToken, getUsersController);

userRouter.put("/", verifyToken, updateUserController);

userRouter.delete("/", verifyToken, deleteUserController);

userRouter.post("/save", verifyToken, savePost);

userRouter.get("/profilePosts", verifyToken, profilePosts);

userRouter.get("/notification", verifyToken, getNotificationNumber);


export default userRouter;