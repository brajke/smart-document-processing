import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = () => {
    fetch("https://smart-document-processing-9946.onrender.com")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleChange = (id, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc._id === id
          ? {
              ...doc,
              extractedData: {
                ...doc.extractedData,
                [field]: value,
              },
            }
          : doc
      )
    );
  };

  const saveDocument = async (doc) => {
    await fetch(`http://localhost:5000/api/documents/${doc._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });

    fetchDocuments();
  };

  const confirmDocument = async (doc) => {
    const updatedDoc = {
      ...doc,
      status: "Validated",
      validationIssues: [],
    };

    await fetch(`http://localhost:5000/api/documents/${doc._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDoc),
    });

    fetchDocuments();
  };

  const rejectDocument = async (doc) => {
    const updatedDoc = {
      ...doc,
      status: "Rejected",
    };

    await fetch(`http://localhost:5000/api/documents/${doc._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDoc),
    });

    fetchDocuments();
  };

  const getStatusClass = (status) => {
    if (status === "Validated") return "status validated";
    if (status === "Rejected") return "status rejected";
    if (status === "Needs Review") return "status review";
    return "status uploaded";
  };

  return (
    <main className="app">
      <section className="header">
        <div>
          <p className="eyebrow">Smart Document Processing</p>
          <h1>Documents Dashboard</h1>
          <p className="subtitle">
            Review extracted invoice data, fix validation issues, and confirm final documents.
          </p>
        </div>

        <div className="stats-card">
          <span>{documents.length}</span>
          <p>Total documents</p>
        </div>
      </section>

      <section className="documents-grid">
        {documents.map((doc) => (
          <article key={doc._id} className="document-card">
            <div className="card-top">
              <div>
                <h2>{doc.originalFileName}</h2>
                <p className="doc-id">ID: {doc._id}</p>
              </div>
              <span className={getStatusClass(doc.status)}>{doc.status}</span>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Document Type</label>
                <input
                  value={doc.documentType || ""}
                  onChange={(e) =>
                    setDocuments((prev) =>
                      prev.map((item) =>
                        item._id === doc._id
                          ? { ...item, documentType: e.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Document Number</label>
                <input
                  value={doc.extractedData?.documentNumber || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "documentNumber", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Supplier</label>
                <input
                  value={doc.extractedData?.supplierName || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "supplierName", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Currency</label>
                <input
                  value={doc.extractedData?.currency || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "currency", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Issue Date</label>
                <input
                  value={doc.extractedData?.issueDate || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "issueDate", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Due Date</label>
                <input
                  value={doc.extractedData?.dueDate || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "dueDate", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Subtotal</label>
                <input
                  value={doc.extractedData?.subtotal || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "subtotal", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Tax</label>
                <input
                  value={doc.extractedData?.tax || ""}
                  onChange={(e) => handleChange(doc._id, "tax", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Total</label>
                <input
                  value={doc.extractedData?.total || ""}
                  onChange={(e) =>
                    handleChange(doc._id, "total", e.target.value)
                  }
                />
              </div>
            </div>

            {doc.extractedData?.lineItems?.length > 0 && (
              <div className="line-items">
                <h3>Line Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.extractedData.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unitPrice}</td>
                        <td>{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {doc.validationIssues?.length > 0 && (
              <div className="issues-box">
                <h3>Validation Issues</h3>
                {doc.validationIssues.map((issue, index) => (
                  <p key={index}>• {issue.message}</p>
                ))}
              </div>
            )}

            <div className="actions">
              <button className="secondary" onClick={() => saveDocument(doc)}>
                Save corrections
              </button>
              <button className="success" onClick={() => confirmDocument(doc)}>
                Confirm
              </button>
              <button className="danger" onClick={() => rejectDocument(doc)}>
                Reject
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;