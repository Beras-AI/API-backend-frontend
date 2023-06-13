import express from "express";
import refreshToken from "../controllers/refreshToken.js";
import {
  Login,
  Logout,
} from "../controllers/usersController.js";
const usersRouter = express.Router();

usersRouter.post("/login", Login);
usersRouter.get("/token", refreshToken);
usersRouter.delete("/logout", Logout);

export default usersRouter;
