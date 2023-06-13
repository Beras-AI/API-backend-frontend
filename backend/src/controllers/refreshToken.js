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
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return errorResponse(res, 401, "Unauthorized");
    const querySnapshot = await collectionRef
      .where("refresh_token", "==", refreshToken)
      .get();

    if (querySnapshot.empty) {
      return errorResponse(res, 403, "Forbidden");
    }

    const userDoc = querySnapshot.docs[0];
    const id = userDoc.id;

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (decoded.id !== id) {
      throw new Error("Token not valid for this user");
    }

    const user = userDoc.data();

    const accessToken = jwt.sign(
      { id: id, name: user.name, email: user.email },
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
