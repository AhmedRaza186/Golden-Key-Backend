import express from "express";
import { verifyAdmin } from "../utils/verifyAdmin.js";
import {
  getUsersController,
  getUserController,
  adminUpdateUserController,
  adminDeleteUserController,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// All routes here require admin token verification
adminRouter.use(verifyAdmin);

adminRouter.get("/users", getUsersController);
adminRouter.get("/users/:id", getUserController);
adminRouter.put("/users/:id", adminUpdateUserController);
adminRouter.delete("/users/:id", adminDeleteUserController);

export default adminRouter;
