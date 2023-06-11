import { getFirestore, Timestamp } from "firebase-admin/firestore";
import Validator from "fastest-validator";
import moment from "moment-timezone";
import { Prices } from "../models/Models.js";
import { errorResponse, successResponse } from "../config/Response.js";
import db from "../config/firebaseService.js";

const firestore = getFirestore(db);
const v = new Validator();
const collectionRef = firestore.collection("Prices");

export const getPrices = async (req, res) => {
  try {
    const { id } = req.params;
    let pricesSnapShot;
    if (id !== undefined) {
      pricesSnapShot = await collectionRef.doc(id).get();
      if (!pricesSnapShot.exists) {
        return errorResponse(res, 404, "No Price Record Found with Id: " + id);
      }
      const pricesData = pricesSnapShot.data();
      const price = new Prices( 
        pricesSnapShot.id,
        pricesData.province,
        pricesData.price,
        pricesData.createdAt,
        pricesData.updatedAt
      );
      return successResponse(res, price); 
    } else {
      pricesSnapShot = await collectionRef.get();
      if (pricesSnapShot.empty) {
        return errorResponse(res, 404, "No Price Record Found");
      }
      const pricesArray = [];
      pricesSnapShot.forEach((doc) => {
        const prices = new Prices(
          doc.id,
          doc.data().province,
          doc.data().price,
          doc.data().createdAt,
          doc.data().updatedAt
        );
        pricesArray.push(prices);
      });
      return successResponse(res, pricesArray);
    }
  } catch (error) {
    console.log("Error getting data: ", error);
  }
};

export const createPrice = async (req, res) => {
  let { province, price } = req.body;
  const schema = {
    province: { type: "string", min: 3, max: 255 },
    price: { type: "string", min: 3, max: 255 },
  };
  const validationResult = v.validate(req.body, schema);
  if (validationResult.length > 0) {
    const message = validationResult.map((result) => result.message);
    return errorResponse(res, 400, message);
  }
  if (!price.match(/^\d*(\.\d+)?$/)) {
    return errorResponse(res, 400, "price is'n number!");
  }
  price = parseInt(price);
  const now = moment().tz("Asia/Jakarta");
  try {
    const data = {
      province,
      price,
      createdAt: Timestamp.fromDate(now.toDate()),
      updatedAt: Timestamp.fromDate(now.toDate()),
    };

    const docRef = await collectionRef.add(data);
    const createdData = {
      id: docRef.id,
      ...data,
    };
    console.log("price created");
    return successResponse(res, createdData, 201, "success");
  } catch (error) {
    console.log("Error creating data: ", error);
    return errorResponse(res);
  }
};

export const updatePrice = async (req, res) => {
  const { id } = req.params;
  let { province, price } = req.body;

  const docRef = collectionRef.doc(id);
  const docToUpdate = await docRef.get();

  if (!docToUpdate) {
    return errorResponse(res, 404, "No Price Record Found");
  }

  const schema = {
    province: { type: "string", min: 3, max: 255 },
    price: { type: "string", min: 3, max: 255 },
  };
  const validationResult = v.validate(req.body, schema);
  if (validationResult.length > 0) {
    const message = validationResult.map((result) => result.message);
    return errorResponse(res, 400, message);
  }
  if (!price.match(/^\d*(\.\d+)?$/)) {
    return errorResponse(res, 400, "price is'n number!");
  }
  price = parseInt(price);
  const now = moment().tz("Asia/Jakarta");

  try {
    const dataToUpdate = {
      province: province !== undefined ? province : docToUpdate.data().province,
      price: price !== undefined ? price : docToUpdate.data().price,
      updatedAt: Timestamp.fromDate(now.toDate()),
    };
    await collectionRef.doc(id).update(dataToUpdate);

    const updatedDoc = await collectionRef.doc(id).get();
    const updatedData = new Prices(
      updatedDoc.id,
      updatedDoc.data().province,
      updatedDoc.data().price
    );
    console.log("Price updated");
    return successResponse(res, updatedData);
  } catch (error) {
    console.log("Error updating data: ", error);
    return errorResponse(res);
  }
};

export const deletePrice = async (req, res) => {
  const { id } = req.params;
  const docRef = collectionRef.doc(id);

  try {
    const docToDelete = await docRef.get();

    if (!docToDelete.exists) {
      return errorResponse(res, 404, "No Price Record Found");
    }

    await docRef.delete();

    console.log("Price deleted");
    return successResponse(res, null, 204);
  } catch (error) {
    console.log("Error deleting data: ", error);
    return errorResponse(res);
  }
};
