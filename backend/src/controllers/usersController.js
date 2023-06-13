import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Validator from "fastest-validator";
import * as dotenv from "dotenv";
import db from "../config/firebaseService.js";
import { errorResponse, successResponse } from "../config/Response.js";

dotenv.config();
const firestore = getFirestore(db);
const collectionRef = firestore.collection("Users");
const v = new Validator();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;


export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const schema = {
      email: { type: "email", min: 3, max: 255 },
      password: { type: "string", min: 8, max: 255 },
    };
    const validationResult = v.validate(req.body, schema);
    if (validationResult.length > 0) {
      const message = validationResult.map((result) => result.message);
      return errorResponse(res, 400, message);
    }
    const snapshot = await collectionRef.where("email", "==", email).get();
    if (snapshot.empty) {
      return errorResponse(res, 404, `Email '${email}' not found`);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      return errorResponse(res, 400, "Wrong password")
    }
    const accessToken = jwt.sign(
      {
        id: userDoc.id,
        name: userData.name,
        email,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: userDoc.id,
        name: userData.name,
        email,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await userDoc.ref.update({
      refresh_token: refreshToken,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // secure: true, aktifkan jika menggunakan HTTPS
    });
    return res.json({
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res);
  }
};


export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, "Cookie not found", 400);
  }

  try {
    const querySnapshot = await collectionRef
      .where("refresh_token", "==", refreshToken)
      .get();

    if (querySnapshot.empty) {
      return errorResponse(res, 404, "User not found");
    }

    const userDoc = querySnapshot.docs[0];

    await userDoc.ref.update({ refresh_token: null });

    res.clearCookie("refreshToken");

    return successResponse(res, null);
  } catch (error) {
    console.log(error);
    return errorResponse(res);
  }
};
