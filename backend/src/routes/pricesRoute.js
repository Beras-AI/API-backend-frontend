import express from "express";
import {
  createPrice,
  deletePrice,
  getPrices,
  updatePrice,
} from "../controllers/pricesController.js";

const pricesRouter = express.Router();

pricesRouter.get("/", getPrices);
pricesRouter.get("/:province", getPrices);
pricesRouter.post("/", createPrice);
pricesRouter.put("/:id", updatePrice);
pricesRouter.delete("/:id", deletePrice);

export default pricesRouter;
