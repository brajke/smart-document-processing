const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ["invoice", "purchase_order", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["Uploaded", "Needs Review", "Validated", "Rejected"],
      default: "Uploaded",
    },
    extractedData: {
      supplierName: String,
      documentNumber: String,
      issueDate: String,
      dueDate: String,
      currency: String,
      subtotal: Number,
      tax: Number,
      total: Number,
      lineItems: [
        {
          description: String,
          quantity: Number,
          unitPrice: Number,
          total: Number,
        },
      ],
    },
    validationIssues: [
      {
        field: String,
        message: String,
        severity: {
          type: String,
          enum: ["warning", "error"],
          default: "warning",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);