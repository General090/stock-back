// utils/generateReceipt.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateReceipt(data: {
  customer?: string;
  products: { name: string; quantity: number; price: number }[];
}) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Product Receipt", 14, 20);

  if (data.customer) {
    doc.setFontSize(12);
    doc.text(`Customer: ${data.customer}`, 14, 30);
  }

  autoTable(doc, {
    startY: 40,
    head: [["Name", "Quantity", "Price", "Total"]],
    body: data.products.map((p) => [
      p.name,
      p.quantity,
      `$${p.price.toFixed(2)}`,
      `$${(p.price * p.quantity).toFixed(2)}`,
    ]),
  });

  const total = data.products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  );

  doc.text(`Total: $${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save("receipt.pdf");
}
