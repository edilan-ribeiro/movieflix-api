import express from "express";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import moviesRoute from "./routes/moviesRoute";
import genresRoute from "./routes/genresRoute";

const port = 3000;
const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use("/", moviesRoute);
app.use("/", genresRoute);

app.listen(port, () => {
    console.log("Servidor em execução");
});

