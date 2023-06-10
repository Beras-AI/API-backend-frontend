/* eslint-disable linebreak-style */
/* eslint-disable no-console */
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import db from "../config/firebaseService.js";
import { getFirestore } from "firebase-admin/firestore";
import { errorResponse, successResponse } from "../config/Response.js";

dotenv.config();
const firestore = getFirestore(db);
const collectionRef = firestore.collection("Users");

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = process.env;

const refreshToken = async (req, res) => {
  try {
    const refreshtoken = req.cookies.refreshToken;
    if (!refreshtoken) return errorResponse(res, 401, "Unauthorized");
    const querySnapshot = await collectionRef
      .where("refresh_token", "==", refreshtoken)
      .get();

    if (querySnapshot.empty) {
      return errorResponse(res, 403, "Forbidden");
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    const decoded = jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET);

    if (decoded.userId !== user.id) {
      throw new Error("Token not valid for this user");
    }

    const accessToken = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15s",
      }
    );

    return successResponse(res, { accessToken });
  } catch (error) {
    console.log(error);
    return errorResponse(res, 403, "Forbidden");
  }
};

export default refreshToken;
