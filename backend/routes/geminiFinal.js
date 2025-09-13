import express from "express"
import { askToAssistant } from "../controller/geminiController.js";
const router = express.Router();
router.post("/askassistant",askToAssistant)
export default router;