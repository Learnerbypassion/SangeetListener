import express from "express";
import searchController from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", searchController.searchAll);

export default router;
