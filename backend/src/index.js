import express from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import articlesRouter from "./routes/articlesRoute.js";
import pricesRouter from "./routes/pricesRoute.js";
import tengkulaksRouter from "./routes/tengkulaksRoute.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (_, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.use(
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/articles", articlesRouter);
app.use("/prices", pricesRouter);
app.use("/tengkulaks", tengkulaksRouter);
app.listen(5000, () => {
  console.log("Server running at port 5000");
});
