import express from "express";
import routes from "./routes/routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", routes);

app.listen(3000, () => {
  console.log("Connected to PORT 3000");
});
