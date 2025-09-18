import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import routes from "./routes/routes";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", routes);

app.listen(4000, () => {
  console.log("Connected to PORT 4000");
});
