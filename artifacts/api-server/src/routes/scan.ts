import { Router, type IRouter } from "express";
import multer from "multer";
import { createWorker } from "tesseract.js";
import { ScanDocumentResponse } from "@workspace/api-zod";
import { summarizeText, countWords, type SummaryLength } from "../lib/documentIntel";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router: IRouter = Router();

function isSummaryLength(value: unknown): value is SummaryLength {
  return value === "short" || value === "medium" || value === "long";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractImageText(buffer: Buffer, req: { log: { warn: (obj: unknown, msg: string) => void } }): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text ?? "";
  } catch (err) {
    req.log.warn({ err }, "OCR extraction failed");
    return "";
  } finally {
    await worker.terminate();
  }
}

router.post(
  "/scan",
  upload.single("file"),
  async (req, res): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const lengthRaw = Array.isArray(req.body?.length)
      ? req.body.length[0]
      : req.body?.length;
    const length: SummaryLength = isSummaryLength(lengthRaw)
      ? lengthRaw
      : "medium";

    const filename = file.originalname;
    const lowerName = filename.toLowerCase();

    let extractedText = "";

    try {
      if (lowerName.endsWith(".pdf")) {
        extractedText = await extractPdfText(file.buffer);
        if (!extractedText.trim()) {
          req.log.info("PDF text layer empty, falling back to OCR");
          extractedText = await extractImageText(file.buffer, req);
        }
      } else if (
        lowerName.endsWith(".png") ||
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg") ||
        lowerName.endsWith(".webp")
      ) {
        extractedText = await extractImageText(file.buffer, req);
      } else {
        res.status(400).json({
          error: "Unsupported file type. Please upload a PDF or image.",
        });
        return;
      }
    } catch (err) {
      req.log.error({ err }, "Document extraction failed");
      res.json({
        filename,
        text: "",
        summary: `Error extracting text: ${err instanceof Error ? err.message : "unknown error"}`,
        keyPoints: ["Extraction failed"],
        wordCount: 0,
      });
      return;
    }

    if (!extractedText.trim()) {
      res.json(
        ScanDocumentResponse.parse({
          filename,
          text: "",
          summary: "No text could be extracted from this document.",
          keyPoints: ["No data found"],
          wordCount: 0,
        }),
      );
      return;
    }

    const { summary, keyPoints } = summarizeText(extractedText, length);

    res.json(
      ScanDocumentResponse.parse({
        filename,
        text: extractedText,
        summary,
        keyPoints: keyPoints.length > 0 ? keyPoints : ["No key points found"],
        wordCount: countWords(extractedText),
      }),
    );
  },
);

export default router;
