import express from "express";
import {
  getChats,
  getChat,
  addChat,
  readChat,
} from "../controllers/chatController.js";
import { verifyToken } from "../utils/verifyToken.js";

const chatRoutes = express.Router();

chatRoutes.get("/", verifyToken, getChats);
chatRoutes.get("/:id", verifyToken, getChat);
chatRoutes.post("/", verifyToken, addChat);
chatRoutes.put("/read/:id", verifyToken, readChat);

export default chatRoutes;