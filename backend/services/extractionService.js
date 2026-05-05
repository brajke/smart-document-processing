const fs = require("fs");
const { PDFParse } = require("pdf-parse");

function extractStructuredData(text) {
  const data = {
    lineItems: [],
  };

  if (/purchase order/i.test(text)) {
    data.documentType = "purchase_order";
  } else if (/invoice/i.test(text)) {
    data.documentType = "invoice";
  } else {
    data.documentType = "unknown";
  }

  const supplierMatch = text.match(/Supplier[:\s]+(.+)/i);
  if (supplierMatch) data.supplierName = supplierMatch[1].trim();

  const numberMatch =
    text.match(/Number[:\s]+(\S+)/i) ||
    text.match(/Invoice\s+(\S+)/i) ||
    text.match(/Purchase Order\s+(\S+)/i);

  if (numberMatch) data.documentNumber = numberMatch[1];

  const issueDateMatch =
    text.match(/Issue Date[:\s]+(\d{4}-\d{2}-\d{2})/i) ||
    text.match(/Date[:\s]+(\d{4}-\d{2}-\d{2})/i);

  if (issueDateMatch) data.issueDate = issueDateMatch[1];

  const dueDateMatch = text.match(/Due Date[:\s]+(\d{4}-\d{2}-\d{2})/i);
  if (dueDateMatch) data.dueDate = dueDateMatch[1];

  const currencyMatch = text.match(/\b(EUR|BAM|USD|GBP)\b/i);
  if (currencyMatch) data.currency = currencyMatch[1].toUpperCase();

  const subtotalMatch = text.match(/Subtotal[:\s]+([\d.]+)/i);
  if (subtotalMatch) data.subtotal = parseFloat(subtotalMatch[1]);

  const taxMatch = text.match(/Tax(?:\s*\(\d+%\))?[:\s]+([\d.]+)/i);
  if (taxMatch) data.tax = parseFloat(taxMatch[1]);

  const totalMatches = [...text.matchAll(/Total[:\s]+([\d.]+)/gi)];
  if (totalMatches.length > 0) {
    const lastTotal = totalMatches[totalMatches.length - 1];
    data.total = parseFloat(lastTotal[1]);
  }

  const lineItemRegex = /^(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)$/gm;
  let itemMatch;

  while ((itemMatch = lineItemRegex.exec(text)) !== null) {
    const description = itemMatch[1].trim();

    if (
      /subtotal|tax|total|description|supplier|number|date/i.test(description)
    ) {
      continue;
    }

    data.lineItems.push({
      description,
      quantity: Number(itemMatch[2]),
      unitPrice: Number(itemMatch[3]),
      total: Number(itemMatch[4]),
    });
  }

  return data;
}

function extractFromText(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  return extractStructuredData(text);
}

async function extractFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();

  return extractStructuredData(result.text);
}

module.exports = { extractFromText, extractFromPDF };