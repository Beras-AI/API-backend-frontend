import { getFirestore, Timestamp } from "firebase-admin/firestore";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Validator from "fastest-validator";
import * as dotenv from "dotenv";
import { Users } from "../models/Models.js";
import db from "../config/firebaseService.js";
import { errorResponse, successResponse } from "../config/Response.js";

dotenv.config();
const firestore = getFirestore(db);
const collectionRef = firestore.collection("Users");
const v = new Validator();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export const getUsers = async (req, res) => {
  try {
    const usersSnapShot = await collectionRef.get();
    if (usersSnapShot.empty) {
      return errorResponse(res, 404, "No User Record Found");
    }
    const usersArray = [];
    usersSnapShot.forEach((doc) => {
      const users = new Users(doc.id, doc.data().name, doc.data().email);
      usersArray.push(users);
    });
    return successResponse(res, usersArray);
  } catch (error) {
    console.log(error);
    return errorResponse(res);
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, confPassword } = req.body;
  try {
    const existingUser = await collectionRef.where("email", "==", email).get();
    if (!existingUser.empty) {
      return errorResponse(res, 400, email + " Telah Terdaftar");
    }
    const schema = {
      email: { type: "email", min: 3, max: 255 },
      name: { type: "string", min: 1, max: 255 },
      password: { type: "string", min: 8, max: 255 },
      confPassword: { type: "string", min: 8, max: 255 },
    };
    const validationResult = v.validate(req.body, schema);
    if (validationResult.length > 0) {
      const message = validationResult.map((result) => result.message);
      return errorResponse(res, 400, message);
    }
    if (password !== confPassword) {
      return errorResponse(res, 400, "Password & Confirm Password not match");
    }
    const now = moment().tz("Asia/Jakarta");
    try {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const data = {
        name,
        email,
        password: hashPassword,
        refresh_token: null,
        createdAt: Timestamp.fromDate(now.toDate()),
        updatedAt: Timestamp.fromDate(now.toDate()),
      };
      const docRef = await collectionRef.add(data);
      const createdData = {
        id: docRef.id,
        ...data,
      };
      console.log("users created");
      return successResponse(res, createdData, 201, "success");
    } catch (error) {
      console.log("Error creating users : ", error);
      return errorResponse(res);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(res);
  }
};

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


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const docRef = collectionRef.doc(id);

  try {
    const docToDelete = await docRef.get();
    if (!docToDelete.exists) {
      return errorResponse(res, 404, "No User Record Found");
    }
    await docRef.delete();
    return successResponse(res);
  } catch (error) {
    console.log(error);
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
