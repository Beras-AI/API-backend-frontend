import express from "express";
import {
  createTengkulak,
  deleteTengkulak,
  getTengkulaks,
  updateTengkulak,
} from "../controllers/tengkulaksController.js";
import verifyToken from "../middleware/verifyToken.js";

const tengkulaksRouter = express.Router();

tengkulaksRouter.get("/", getTengkulaks);
tengkulaksRouter.get("/:id", getTengkulaks);
tengkulaksRouter.post("/", verifyToken, createTengkulak);
tengkulaksRouter.put("/:id", verifyToken, updateTengkulak);
tengkulaksRouter.delete("/:id", verifyToken, deleteTengkulak);

export default tengkulaksRouter;
