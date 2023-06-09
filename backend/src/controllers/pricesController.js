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
    const { province } = req.params;
    let pricesSnapShot;
    if (province !== undefined) {
      pricesSnapShot = await collectionRef
        .where("province", "==", province)
        .get();
      if (pricesSnapShot.empty) {
        // menggunakan .empty karena pricesSnapShot bukan dokumen, tapi QuerySnapshot
        return errorResponse(
          res,
          404,
          "No Price Record Found with Province: " + province
        );
      }
      const pricesArray = []; // membuat array untuk menampung hasil pencarian
      pricesSnapShot.forEach((doc) => {
        const prices = new Prices( // membuat objek Prices dari setiap dokumen yang ditemukan
          doc.id,
          doc.data().province,
          doc.data().price,
          doc.data().createdAt,
          doc.data().updatedAt
        );
        pricesArray.push(prices); // memasukkan objek ke dalam array
      });
      return successResponse(res, pricesArray); // mengembalikan array yang berisi objek prices ke client
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
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
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

  // Cari dokumen dengan ID yang sesuai di firestore
  const docRef = collectionRef.doc(id);
  const docToUpdate = await docRef.get();

  if (!docToUpdate) {
    return errorResponse(res, 404, "No Price Record Found");
  }

  const schema = {
    province: { type: "string", min: 3, max: 255 },
    price: { type: "string", min: 3, max: 255 },
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
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
    // Get data artikel yang ingin dihapus sebelum dihapus
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
