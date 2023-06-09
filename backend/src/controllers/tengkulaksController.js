import { getFirestore, Timestamp } from "firebase-admin/firestore";
import Validator from "fastest-validator";
import moment from "moment-timezone";
import { Tengkulaks } from "../models/Models.js";
import { errorResponse, successResponse } from "../config/Response.js";
import db from "../config/firebaseService.js";

const firestore = getFirestore(db);
const v = new Validator();
const collectionRef = firestore.collection("Tengkulaks");

export const getTengkulaks = async (req, res) => {
  try {
    const { address } = req.params;
    let tengkulaksSnapShot;
    if (address !== undefined) {
      tengkulaksSnapShot = await collectionRef
        .where("address", "==", address)
        .get();
      if (tengkulaksSnapShot.empty) {
        // menggunakan .empty karena tengkulaksSnapShot bukan dokumen, tapi QuerySnapshot
        return errorResponse(
          res,
          404,
          "No Tengkulak Record Found with Address: " + address
        );
      }
      const tengkulaksArray = []; // membuat array untuk menampung hasil pencarian
      tengkulaksSnapShot.forEach((doc) => {
        const tengkulaks = new Tengkulaks( // membuat objek Tengkulaks dari setiap dokumen yang ditemukan
          doc.id,
          doc.data().name,
          doc.data().address,
          doc.data().phone,
          doc.data().createdAt,
          doc.data().updatedAt
        );
        tengkulaksArray.push(tengkulaks); // memasukkan objek ke dalam array
      });
      return successResponse(res, tengkulaksArray); // mengembalikan array yang berisi objek tengkulaks ke client
    } else {
      tengkulaksSnapShot = await collectionRef.get();
      if (tengkulaksSnapShot.empty) {
        return errorResponse(res, 404, "No tengkulak Record Found");
      }
      const tengkulaksArray = [];
      tengkulaksSnapShot.forEach((doc) => {
        const tengkulaks = new Tengkulaks(
          doc.id,
          doc.data().name,
          doc.data().address,
          doc.data().phone,
          doc.data().createdAt,
          doc.data().updatedAt
        );
        tengkulaksArray.push(tengkulaks);
      });
      return successResponse(res, tengkulaksArray);
    }
  } catch (error) {
    console.log("Error getting data: ", error);
  }
};

export const createTengkulak = async (req, res) => {
  let { name, address, phone } = req.body;
  const schema = {
    name: { type: "string", min: 3, max: 255 },
    address: { type: "string", min: 3, max: 255 },
    phone: { type: "string", min: 3, max: 255 },
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
  }
  const now = moment().tz("Asia/Jakarta");
  try {
    const data = {
      name,
      address,
      phone,
      createdAt: Timestamp.fromDate(now.toDate()),
      updatedAt: Timestamp.fromDate(now.toDate()),
    };

    const docRef = await collectionRef.add(data);
    const createdData = {
      id: docRef.id,
      ...data,
    };
    console.log("tengkulak created");
    return successResponse(res, createdData, 201, "success");
  } catch (error) {
    console.log("Error creating data: ", error);
    return errorResponse(res);
  }
};

export const updateTengkulak = async (req, res) => {
  const { id } = req.params;
  let { name, address, phone } = req.body;

  // Cari dokumen dengan ID yang sesuai di firestore
  const docRef = collectionRef.doc(id);
  const docToUpdate = await docRef.get();

  if (!docToUpdate) {
    return errorResponse(res, 404, "No Tengkulak Record Found");
  }

  const schema = {
    name: { type: "string", min: 3, max: 255 },
    address: { type: "string", min: 3, max: 255 },
    phone: { type: "string", min: 3, max: 255 },
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
  }
  const now = moment().tz("Asia/Jakarta");

  try {
    const dataToUpdate = {
      name: name !== undefined ? name : docToUpdate.data().name,
      address: address !== undefined ? address : docToUpdate.data().address,
      phone: phone !== undefined ? phone : docToUpdate.data().phone,
      updatedAt: Timestamp.fromDate(now.toDate()),
    };
    await collectionRef.doc(id).update(dataToUpdate);

    const updatedDoc = await collectionRef.doc(id).get();
    const updatedData = new Tengkulaks(
      updatedDoc.id,
      updatedDoc.data().name,
      updatedDoc.data().address,
      updatedDoc.data().phone
    );
    console.log("Tengkulak updated");
    return successResponse(res, updatedData);
  } catch (error) {
    console.log("Error updating data: ", error);
    return errorResponse(res);
  }
};

export const deleteTengkulak = async (req, res) => {
  const { id } = req.params;
  const docRef = collectionRef.doc(id);

  try {
    // Get data artikel yang ingin dihapus sebelum dihapus
    const docToDelete = await docRef.get();

    if (!docToDelete.exists) {
      return errorResponse(res, 404, "No Tengkulak Record Found");
    }

    await docRef.delete();

    console.log("Tengkulak deleted");
    return successResponse(res, null, 204);
  } catch (error) {
    console.log("Error deleting data: ", error);
    return errorResponse(res);
  }
};
