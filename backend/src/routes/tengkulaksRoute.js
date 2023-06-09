import express from "express";
import {
  createTengkulak,
  deleteTengkulak,
  getTengkulaks,
  updateTengkulak,
} from "../controllers/tengkulaksController.js";

const tengkulaksRouter = express.Router();

tengkulaksRouter.get("/", getTengkulaks);
tengkulaksRouter.get("/:address", getTengkulaks);
tengkulaksRouter.post("/", createTengkulak);
tengkulaksRouter.put("/:id", updateTengkulak);
tengkulaksRouter.delete("/:id", deleteTengkulak);

export default tengkulaksRouter;
