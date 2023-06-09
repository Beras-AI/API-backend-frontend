import { initializeApp, cert } from "firebase-admin/app";
import 'firebase-admin/storage';
import * as fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./src/config/key.json"));

const db = initializeApp({
  credential: cert(serviceAccount),
});

export default db;
