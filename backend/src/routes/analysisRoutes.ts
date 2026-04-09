import express from "express";
import {
  generateQuestionsFromTopic,
  analyzeQuestion,
  analyzeAssessment,
  analyzePdfContent,
} from "../controllers/analysisController";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/question", analyzeQuestion);
router.post("/assessment", analyzeAssessment);
router.post("/question/pdf", upload.single("file"), analyzePdfContent);
router.post("/topic/questions", generateQuestionsFromTopic);

export default router;
