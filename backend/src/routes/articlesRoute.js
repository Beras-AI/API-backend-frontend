import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from "../controllers/articlesController.js";
import verifyToken from "../middleware/verifyToken.js";

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:id", getArticles);
articlesRouter.post("/", verifyToken, createArticle);
articlesRouter.put("/:id", verifyToken, updateArticle);
articlesRouter.delete("/:id", verifyToken, deleteArticle);

export default articlesRouter;
