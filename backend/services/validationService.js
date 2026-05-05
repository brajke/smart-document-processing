async function validateDocument(data, Document) {
  const issues = [];

  if (!data.supplierName) {
    issues.push({
      field: "supplierName",
      message: "Supplier is missing",
      severity: "error",
    });
  }

  if (!data.documentNumber) {
    issues.push({
      field: "documentNumber",
      message: "Document number is missing",
      severity: "error",
    });
  }

  if (!data.total) {
    issues.push({
      field: "total",
      message: "Total is missing",
      severity: "error",
    });
  }

  if (data.documentNumber) {
    const existingDocument = await Document.findOne({
      "extractedData.documentNumber": data.documentNumber,
    });

    if (existingDocument) {
      issues.push({
        field: "documentNumber",
        message: "Duplicate document number detected",
        severity: "error",
      });
    }
  }

  if (data.total && Number(data.total) < 0) {
    issues.push({
      field: "total",
      message: "Total cannot be negative",
      severity: "error",
    });
  }

  if (data.issueDate) {
    const issueDate = new Date(data.issueDate);

    if (isNaN(issueDate.getTime())) {
      issues.push({
        field: "issueDate",
        message: "Issue date is invalid",
        severity: "error",
      });
    }
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);

    if (isNaN(dueDate.getTime())) {
      issues.push({
        field: "dueDate",
        message: "Due date is invalid",
        severity: "error",
      });
    }
  }

  if (data.issueDate && data.dueDate) {
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);

    if (
      !isNaN(issueDate.getTime()) &&
      !isNaN(dueDate.getTime()) &&
      dueDate < issueDate
    ) {
      issues.push({
        field: "dueDate",
        message: "Due date cannot be before issue date",
        severity: "error",
      });
    }
  }

  if (
    data.subtotal !== undefined &&
    data.tax !== undefined &&
    data.total !== undefined
  ) {
    const expectedTotal = Number(data.subtotal) + Number(data.tax);

    if (Math.abs(expectedTotal - Number(data.total)) > 0.01) {
      issues.push({
        field: "total",
        message: "Total does not match subtotal + tax",
        severity: "error",
      });
    }
  }

  if (data.lineItems && data.lineItems.length > 0) {
    data.lineItems.forEach((item, index) => {
      const expectedLineTotal = Number(item.quantity) * Number(item.unitPrice);

      if (Math.abs(expectedLineTotal - Number(item.total)) > 0.01) {
        issues.push({
          field: `lineItems[${index}].total`,
          message: "Line item total does not match quantity * unit price",
          severity: "error",
        });
      }
    });
  }

  return issues;
}

module.exports = { validateDocument };