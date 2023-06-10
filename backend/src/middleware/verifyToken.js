/* eslint-disable linebreak-style */
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const { ACCESS_TOKEN_SECRET } = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  return jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.email = decoded.email;
    return next();
  });
};

export default verifyToken;
