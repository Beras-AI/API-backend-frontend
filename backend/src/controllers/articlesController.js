import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import moment from "moment-timezone";
import Validator from "fastest-validator";
import { Articles } from "../models/Models.js";
import { errorResponse, successResponse } from "../config/Response.js";
import db from "../config/firebaseService.js";

const firestore = getFirestore(db);
const storage = getStorage(db);
const bucket = storage.bucket("gs://capstone-388209.appspot.com");
const v = new Validator();
const collectionRef = firestore.collection("Articles");

export const getArticles = async (req, res) => {
  try {
    const { id } = req.params;
    let articlesSnapShot;
    if (id !== undefined) {
      articlesSnapShot = await collectionRef.doc(id).get();
      if (!articlesSnapShot.exists) {
        // menggunakan .empty karena articlesSnapShot bukan dokumen, tapi QuerySnapshot
        return errorResponse(
          res,
          404,
          "No Article Record Found with Id: " + id
        );
      }
      const articlesData = articlesSnapShot.data();
      const article = new Articles(
        articlesSnapShot.id,
        articlesData.title,
        articlesData.author,
        articlesData.content,
        articlesData.imageUrl,
        articlesData.createdAt,
        articlesData.updatedAt
      );
      return successResponse(res, article); // mengembalikan array yang berisi objek Articles ke client
    } else {
      articlesSnapShot = await collectionRef.get();
      if (articlesSnapShot.empty) {
        return errorResponse(res, 404, "No Article Record Found");
      }
      const articlesArray = [];
      articlesSnapShot.forEach((doc) => {
        const articles = new Articles(
          doc.id,
          doc.data().title,
          doc.data().author,
          doc.data().content,
          doc.data().imageUrl,
          doc.data().createdAt,
          doc.data().updatedAt
        );
        articlesArray.push(articles);
      });
      return successResponse(res, articlesArray);
    }
  } catch (error) {
    console.log("Error getting data: ", error);
  }
};

export const createArticle = async (req, res) => {
  const { title, author, content } = req.body;
  const schema = {
    title: { type: "string", min: 3, max: 255 },
    author: { type: "string", min: 3, max: 255 },
    content: { type: "string", min: 3 },
  };
  const validate = v.validate({ ...req.body }, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
  }
  try {
    if (!req.files || !req.files.image) {
      return errorResponse(res, 400, "No image was uploaded");
    }
    const buffer = req.files.image.data;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = req.files.image.name.split(".").pop();
    const filePath = `images/${uniqueSuffix}.${fileExt}`;
    const fileRef = bucket.file(filePath);
    try {
      await fileRef.save(buffer, {
        metadata: {
          contentType: "image/jpg",
        },
      });
    } catch (error) {
      console.log("Error uploading image file", error);
      return errorResponse(res);
    }

    const url = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
    const now = moment().tz("Asia/Jakarta");
    const data = {
      title,
      author,
      content,
      imageUrl: url,
      createdAt: Timestamp.fromDate(now.toDate()),
      updatedAt: Timestamp.fromDate(now.toDate()),
    };

    const docRef = await collectionRef.add(data);
    const createdData = {
      id: docRef.id,
      ...data,
    };
    console.log("article created");
    return successResponse(res, createdData, 201, "success");
  } catch (error) {
    console.log("Error creating data: ", error);
    return errorResponse(res);
  }
};

export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, author, content } = req.body;

  // Cari dokumen dengan ID yang sesuai di firestore
  const docRef = collectionRef.doc(id);
  const docToUpdate = await docRef.get();

  if (!docToUpdate) {
    return errorResponse(res, 404, "No Article Record Found");
  }

  // Dapatkan URL image lama untuk artikel sebelum di update
  const oldImageUrl = docToUpdate.data().imageUrl;

  // Buat schema validasi untuk memastikan input user valid
  const schema = {
    title: { type: "string", min: 3, max: 255 },
    author: { type: "string", min: 3, max: 255 },
    content: { type: "string", min: 3 },
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return errorResponse(res, 400, validate);
  }

  try {
    if (req.files && req.files.image) {
      // Ambil data file baru dari request dan upload ke storage
      const buffer = req.files.image.data;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExt = req.files.image.name.split(".").pop();
      const filePath = `images/${uniqueSuffix}.${fileExt}`;
      const fileRef = bucket.file(filePath);

      try {
        await fileRef.save(buffer, {
          metadata: {
            contentType: "image/jpg",
          },
        });
      } catch (error) {
        console.log("Error uploading new image file", error);
        return errorResponse(res);
      }

      const newImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
      const now = moment().tz("Asia/Jakarta");
      // Update data pada dokumen dengan data baru yang diberikan oleh user
      const dataToUpdate = {
        title: title !== undefined ? title : docToUpdate.data().title,
        author: author !== undefined ? author : docToUpdate.data().author,
        content: content !== undefined ? content : docToUpdate.data().content,
        imageUrl: newImageUrl,
        updatedAt: Timestamp.fromDate(now.toDate()),
      };

      await collectionRef.doc(id).update(dataToUpdate);

      if (oldImageUrl) {
        // Ambil nama file lama saja dari URL
        const oldFileName = oldImageUrl.split("/").pop();
        const oldFileRef = bucket.file(`images/${oldFileName}`);

        try {
          await oldFileRef.delete();
        } catch (error) {
          console.log("Error deleting old image file", error);
        }
      }

      // Get data hasil update dan kirim sebagai response ke client
      const updatedDoc = await collectionRef.doc(id).get();
      const updatedData = new Articles(
        updatedDoc.id,
        updatedDoc.data().title,
        updatedDoc.data().author,
        updatedDoc.data().content,
        updatedDoc.data().imageUrl
      );

      console.log("Article updated");
      return successResponse(res, updatedData);
    } else {
      // User tidak mengirim file baru, cukup simpan seperti biasa

      // Update data pada dokumen dengan data baru yang diberikan oleh user
      const now = moment().tz("Asia/Jakarta");
      const dataToUpdate = {
        title: title !== undefined ? title : docToUpdate.data().title,
        author: author !== undefined ? author : docToUpdate.data().author,
        content: content !== undefined ? content : docToUpdate.data().content,
        imageUrl: oldImageUrl,
        updatedAt: Timestamp.fromDate(now.toDate()),
      };
      await collectionRef.doc(id).update(dataToUpdate);

      // Get data hasil update dan kirim sebagai response ke client
      const updatedDoc = await collectionRef.doc(id).get();
      const updatedData = new Articles(
        updatedDoc.id,
        updatedDoc.data().title,
        updatedDoc.data().author,
        updatedDoc.data().content,
        updatedDoc.data().imageUrl
      );
      console.log("Article updated");
      return successResponse(res, updatedData);
    }
  } catch (error) {
    console.log("Error updating data: ", error);
    return errorResponse(res);
  }
};

export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  const docRef = collectionRef.doc(id);

  try {
    // Get data artikel yang ingin dihapus sebelum dihapus
    const docToDelete = await docRef.get();

    if (!docToDelete.exists) {
      return errorResponse(res, 404, "No Article Record Found");
    }

    // Hapus dokumen pada firestore
    await docRef.delete();

    // Jika ada image pada artikel yang dihapus, hapus juga file image-nya dari storage
    if (docToDelete.data().imageUrl) {
      const fileName = docToDelete.data().imageUrl.split("/").pop();
      const fileRef = bucket.file(`images/${fileName}`);

      try {
        await fileRef.delete();
      } catch (error) {
        console.log("Error deleting image file", error);
      }
    }

    console.log("Article deleted");
    return successResponse(res, null, 204);
  } catch (error) {
    console.log("Error deleting data: ", error);
    return errorResponse(res);
  }
};
