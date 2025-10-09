import express from "express";
import mockUserData from "../data/mockUserData.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(mockUserData);
});

export default router;
