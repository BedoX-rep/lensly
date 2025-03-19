import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, FileText, Printer, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getReceipts as fetchReceipts } from "@/integrations/supabase/queries";


const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null); 

  useEffect(() => {
    const loadReceipts = async () => {
      const receiptsData = await getReceipts();
      setReceipts(receiptsData);
    };

    loadReceipts();
  }, []);

  const filteredReceipts = receipts.filter(receipt => 
    receipt.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewReceipt = async (receiptId: string) => {
    const receiptDetails = await getReceiptDetails(receiptId); 
    setSelectedReceipt(receiptDetails);
    setIsViewDialogOpen(true);
  };

  const handlePrintReceipt = async (id: string) => {
    try {
      const receiptDetails = await getReceiptDetails(id);
      const success = printReceipt(receiptDetails);
      if (!success) {
        toast.error("Failed to print receipt");
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
      toast.error("Failed to print receipt");
    }
  };

  const handleDownloadReceipt = async (id: string) => {
    try {
      const receiptDetails = await getReceiptDetails(id);
      const success = await downloadReceipt(receiptDetails);
      if (!success) {
        toast.error("Failed to download receipt");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Unpaid":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
            <p className="text-muted-foreground">
              View and manage prescription receipts
            </p>
          </div>

          <Link to="/receipt/new">
            <Button className="gap-1">
              <FileText className="h-4 w-4" /> New Receipt
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              type="search"
              placeholder="Search by client name..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="p-2 rounded-md border bg-background text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Advance Paid</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">#{receipt.id}</TableCell>
                      <TableCell>{receipt.clientName}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell className="text-right">${receipt.total.toFixed(2)}</TableCell>
                      <TableCell>${(receipt.advancePayment || 0).toFixed(2)}</TableCell>
                      <TableCell>${receipt.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(receipt.status)}`}>
                          {receipt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewReceipt(receipt.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handlePrintReceipt(receipt.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadReceipt(receipt.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No receipts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Receipt #{selectedReceipt ? selectedReceipt.id : ''}</DialogTitle> 
            </DialogHeader>

            {selectedReceipt && ( 
              <div className="space-y-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Client Information</h3>
                    <p>{selectedReceipt.clientName}</p>
                    <p className="text-muted-foreground">{selectedReceipt.phone}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium">Receipt Date</h3>
                    <p>{selectedReceipt.date}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Prescription</h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Right Eye</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">SPH:</span> {selectedReceipt.prescription.rightEye.sph}
                        </div>
                        <div>
                          <span className="text-muted-foreground">CYL:</span> {selectedReceipt.prescription.rightEye.cyl}
                        </div>
                        <div>
                          <span className="text-muted-foreground">AXE:</span> {selectedReceipt.prescription.rightEye.axe}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Left Eye</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">SPH:</span> {selectedReceipt.prescription.leftEye.sph}
                        </div>
                        <div>
                          <span className="text-muted-foreground">CYL:</span> {selectedReceipt.prescription.leftEye.cyl}
                        </div>
                        <div>
                          <span className="text-muted-foreground">AXE:</span> {selectedReceipt.prescription.leftEye.axe}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <table id="receipt-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReceipt.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="text-right">${item.price.toFixed(2)}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Summary</h3>
                  <table id="payment-summary">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Subtotal</td>
                        <td className="text-right">${selectedReceipt.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Tax</td>
                        <td className="text-right">${selectedReceipt.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Discount</td>
                        <td className="text-right">${selectedReceipt.discount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Total</td>
                        <td className="text-right">${selectedReceipt.total.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Advance Payment</td>
                        <td className="text-right">${selectedReceipt.advancePayment.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Balance Due</td>
                        <td className="text-right">${selectedReceipt.balance.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handlePrintReceipt(selectedReceipt.id)} className="gap-1">
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReceipt(selectedReceipt.id)} className="gap-1">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Receipts;

const getReceipts = async () => {
  const receiptsData = await fetchReceipts();
  return receiptsData.map(receipt => ({
    id: receipt.id,
    clientName: receipt.clients?.name || 'Unknown',
    date: new Date(receipt.created_at).toLocaleDateString(),
    total: receipt.total || 0,
    advancePayment: receipt.advance_payment || 0,
    balance: receipt.balance || 0,
    status: receipt.balance === 0 ? "Paid" : receipt.advance_payment > 0 ? "Partially Paid" : "Unpaid"
  }));
};


const getReceiptDetails = async (receiptId: string) => {
    const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .select(`
            *,
            clients (
                name,
                phone
            ),
            receipt_items (
                quantity,
                price,
                products (
                    name
                )
            )
        `)
        .eq('id', receiptId)
        .single();

    if (receiptError) throw receiptError;

    const items = receipt.receipt_items.map(item => ({
        name: item.products.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
    }));

    return {
        id: receipt.id,
        clientName: receipt.clients.name,
        phone: receipt.clients.phone,
        date: new Date(receipt.created_at).toLocaleDateString(),
        prescription: {
            rightEye: { 
                sph: receipt.right_eye_sph?.toString() || "0", 
                cyl: receipt.right_eye_cyl?.toString() || "0", 
                axe: receipt.right_eye_axe?.toString() || "0" 
            },
            leftEye: { 
                sph: receipt.left_eye_sph?.toString() || "0", 
                cyl: receipt.left_eye_cyl?.toString() || "0", 
                axe: receipt.left_eye_axe?.toString() || "0" 
            }
        },
        items,
        subtotal: receipt.subtotal,
        tax: receipt.tax,
        discount: receipt.discount_amount || 0,
        total: receipt.total,
        advancePayment: receipt.advance_payment || 0,
        balance: receipt.balance
    };
}

const printReceipt = (receiptDetails) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Receipt", 10, 10);


  doc.autoTable({ html: '#receipt-table' }); 
  doc.autoTable({ html: '#payment-summary' }); 

  doc.save('receipt.pdf');
  return true; 
};

const downloadReceipt = async (receiptDetails) => {
    try {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.text('Receipt', 105, 15, { align: 'center' });

        // Add client info
        doc.setFontSize(12);
        doc.text(`Client: ${receiptDetails.clientName || 'N/A'}`, 20, 30);
        doc.text(`Phone: ${receiptDetails.phone || 'N/A'}`, 20, 37);
        doc.text(`Date: ${receiptDetails.date}`, 20, 44);

        // Add prescription details if available
        if (receiptDetails.prescription) {
            doc.text('Prescription:', 20, 55);
            doc.autoTable({
                startY: 60,
                head: [['Eye', 'SPH', 'CYL', 'AXE']],
                body: [
                    ['Right Eye', 
                     receiptDetails.prescription.rightEye.sph || 'N/A', 
                     receiptDetails.prescription.rightEye.cyl || 'N/A', 
                     receiptDetails.prescription.rightEye.axe || 'N/A'],
                    ['Left Eye', 
                     receiptDetails.prescription.leftEye.sph || 'N/A', 
                     receiptDetails.prescription.leftEye.cyl || 'N/A', 
                     receiptDetails.prescription.leftEye.axe || 'N/A'],
                ],
            });
        }

        // Add items
        const items = receiptDetails.items || [];
        if (items.length > 0) {
            doc.autoTable({
                startY: receiptDetails.prescription ? doc.lastAutoTable.finalY + 10 : 60,
                head: [['Item', 'Quantity', 'Price', 'Total']],
                body: items.map(item => [
                    item.name || 'N/A',
                    item.quantity || '0',
                    (item.price || 0).toFixed(2),
                    (item.total || 0).toFixed(2)
                ]),
            });
        }

        // Add totals
        const finalY = items.length > 0 ? doc.lastAutoTable.finalY + 10 : 80;
        doc.text(`Subtotal: $${(receiptDetails.subtotal || 0).toFixed(2)}`, 140, finalY);
        doc.text(`Tax: $${(receiptDetails.tax || 0).toFixed(2)}`, 140, finalY + 7);
        doc.text(`Discount: $${(receiptDetails.discount || 0).toFixed(2)}`, 140, finalY + 14);
        doc.text(`Total: $${(receiptDetails.total || 0).toFixed(2)}`, 140, finalY + 21);
        doc.text(`Advance Payment: $${(receiptDetails.advancePayment || 0).toFixed(2)}`, 140, finalY + 28);
        doc.text(`Balance: $${(receiptDetails.balance || 0).toFixed(2)}`, 140, finalY + 35);

        // Save the PDF
        doc.save(`receipt-${receiptDetails.clientName}-${receiptDetails.date}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};