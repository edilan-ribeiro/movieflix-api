import express from "express";
import { moviesByGenreController, moviesCreateController, moviesDeleteController, moviesFilterController, moviesHomeController, moviesUpdateController } from "../controller/moviesController";

const router = express.Router();

router.get("/movies", moviesHomeController);
router.get("/movies/filter", moviesFilterController); 
router.post("/movies", moviesCreateController);
router.put("/movies/:id", moviesUpdateController);
router.delete("/movies/:id", moviesDeleteController);
router.get("/movies/:genreName", moviesByGenreController);

export default router;