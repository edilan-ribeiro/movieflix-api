import express from "express";
import { genreByIdController, genreCreateController, genreDeleteController, genreHomeController } from "../controller/genresController";

const router = express.Router();

router.get("/genres", genreHomeController);
router.put("/genres/:id", genreByIdController);
router.post("/genres", genreCreateController);
router.delete("/genres/:id", genreDeleteController);

export default router;