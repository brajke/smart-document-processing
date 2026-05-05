const express = require("express");
const multer = require("multer");
const Document = require("../models/Document");

const router = express.Router();
const { validateDocument } = require("../services/validationService");
const { extractFromText, extractFromPDF } = require("../services/extractionService");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    let extractedData = {};

    if (req.file.mimetype === "application/pdf") {
        extractedData = await extractFromPDF(req.file.path);
    } else {
        extractedData = extractFromText(req.file.path);
    }

    const validationIssues = await validateDocument(extractedData, Document);
    
    const newDocument = await Document.create({
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      status: validationIssues.length ? "Needs Review" : "Validated",
      documentType: extractedData.documentType || "unknown",
      extractedData: extractedData,
      validationIssues: validationIssues,
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch document",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update document",
      error: error.message,
    });
  }
});

module.exports = router;