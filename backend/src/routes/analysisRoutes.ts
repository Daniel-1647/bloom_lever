import express from "express";
import {
  analyzeQuestion,
  analyzeAssessment,
} from "../controllers/analysisController";

const router = express.Router();

router.post("/question", analyzeQuestion);
router.post("/assessment", analyzeAssessment);

export default router;
