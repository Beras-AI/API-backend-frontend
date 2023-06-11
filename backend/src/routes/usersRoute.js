import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import refreshToken from "../controllers/refreshToken.js";
import {
  getUsers,
  createUser,
  Login,
  Logout,
  deleteUser,
} from "../controllers/usersController.js";
const usersRouter = express.Router();

usersRouter.get("/users",  verifyToken, getUsers);
usersRouter.post("/users", createUser);
usersRouter.delete("/users/:id", deleteUser);
usersRouter.post("/login", Login);
usersRouter.get("/token", refreshToken);
usersRouter.delete("/logout", Logout);

export default usersRouter;
