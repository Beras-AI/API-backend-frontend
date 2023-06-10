import express from "express";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
} from "../controllers/articlesController.js";

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:id", getArticles);
articlesRouter.post("/", createArticle);
articlesRouter.put("/:id", updateArticle);
articlesRouter.delete("/:id", deleteArticle);

export default articlesRouter;
