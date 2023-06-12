import express from "express";
import {
  createPrice,
  deletePrice,
  getPrices,
  updatePrice,
} from "../controllers/pricesController.js";
import verifyToken from "../middleware/verifyToken.js";

const pricesRouter = express.Router();

pricesRouter.get("/", getPrices);
pricesRouter.get("/:id", getPrices);
pricesRouter.post("/", verifyToken, createPrice);
pricesRouter.put("/:id", verifyToken, updatePrice);
pricesRouter.delete("/:id", verifyToken, deletePrice);

export default pricesRouter;
