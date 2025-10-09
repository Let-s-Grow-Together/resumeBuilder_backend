import express from "express";
import {templates} from "../data/templates.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(templates);
});

export default router;
