import express from "express";
import {
  addMessage
} from "../controllers/messageController.js";
import {verifyToken} from "../utils/verifyToken.js";

const router = express.Router();


router.post("/:chatId", verifyToken, addMessage);

export default router;