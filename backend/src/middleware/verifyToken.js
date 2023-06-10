/* eslint-disable linebreak-style */
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { errorResponse } from "../config/Response.js";

dotenv.config();

const { ACCESS_TOKEN_SECRET } = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return errorResponse(res, 401, "Unauthorized");
  }
  return jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return errorResponse(res, 403, "Forbidden");
    }
    req.email = decoded.email;
    return next();
  });
};

export default verifyToken;
