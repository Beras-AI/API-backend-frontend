import express from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import articlesRouter from "./routes/articlesRoute.js";
import pricesRouter from "./routes/pricesRoute.js";
import tengkulaksRouter from "./routes/tengkulaksRoute.js";
import usersRouter from "./routes/usersRoute.js";

dotenv.config();
const app = express();

const whitelist = ["http://localhost:8080"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(usersRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/prices", pricesRouter);
app.use("/api/tengkulaks", tengkulaksRouter);
app.listen(5000, () => {
  console.log("Server running at port 5000");
});
