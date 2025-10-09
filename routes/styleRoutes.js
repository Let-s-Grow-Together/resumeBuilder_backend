import express from "express";
import templateStyles from "../data/templateStyle.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(templateStyles);
});

export default router;
