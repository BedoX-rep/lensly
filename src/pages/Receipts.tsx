import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Search, Eye, FileText, Printer, Download, Calendar, Trash2, Edit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getReceipts as fetchReceipts, deleteReceipt, updateReceipt } from "@/integrations/supabase/queries";
import { useForm } from "react-hook-form";

const Receipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const editForm = useForm({
    defaultValues: {
      advancePayment: 0,
      rightEyeSph: "",
      rightEyeCyl: "",
      rightEyeAxe: "",
      leftEyeSph: "",
      leftEyeCyl: "",
      leftEyeAxe: "",
      addValue: ""
    }
  });

  useEffect(() => {
    loadReceipts();
  }, []);

  useEffect(() => {
    if (selectedReceipt && isEditDialogOpen) {
      editForm.reset({
        advancePayment: selectedReceipt.advancePayment || 0,
        rightEyeSph: selectedReceipt.prescription?.rightEye?.sph || "",
        rightEyeCyl: selectedReceipt.prescription?.rightEye?.cyl || "",
        rightEyeAxe: selectedReceipt.prescription?.rightEye?.axe || "",
        leftEyeSph: selectedReceipt.prescription?.leftEye?.sph || "",
        leftEyeCyl: selectedReceipt.prescription?.leftEye?.cyl || "",
        leftEyeAxe: selectedReceipt.prescription?.leftEye?.axe || "",
        addValue: selectedReceipt.prescription?.add || ""
      });
    }
  }, [selectedReceipt, isEditDialogOpen]);

  const loadReceipts = async () => {
    const receiptsData = await getReceipts();
    setReceipts(receiptsData);
  };

  const filteredReceipts = receipts.filter(receipt => 
    receipt.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewReceipt = async (receiptId) => {
    const receiptDetails = await getReceiptDetails(receiptId);
    setSelectedReceipt(receiptDetails);
    setIsViewDialogOpen(true);
  };

  const handleEditReceipt = async (receiptId) => {
    const receiptDetails = await getReceiptDetails(receiptId);
    setSelectedReceipt(receiptDetails);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReceipt = (receiptId) => {
    setSelectedReceiptId(receiptId);
    setIsDeleteDialogOpen(true);
  };

  const handlePrintReceipt = (receiptId) => {
    toast.info(`Printing receipt #${receiptId}`);
  };

  const handleDownloadReceipt = (receiptId) => {
    toast.info(`Downloading receipt #${receiptId}`);
  };

  const confirmDelete = async () => {
    if (!selectedReceiptId) return;
    
    setIsLoading(true);
    const success = await deleteReceipt(selectedReceiptId);
    setIsLoading(false);
    
    if (success) {
      loadReceipts();
      setIsDeleteDialogOpen(false);
      setSelectedReceiptId(null);
    }
  };

  const onSubmitEdit = async (data) => {
    if (!selectedReceipt) return;
    
    setIsLoading(true);
    
    const updatedFields = {
      advance_payment: Number(data.advancePayment),
      right_eye_sph: data.rightEyeSph ? Number(data.rightEyeSph) : null,
      right_eye_cyl: data.rightEyeCyl ? Number(data.rightEyeCyl) : null,
      right_eye_axe: data.rightEyeAxe ? Number(data.rightEyeAxe) : null,
      left_eye_sph: data.leftEyeSph ? Number(data.leftEyeSph) : null,
      left_eye_cyl: data.leftEyeCyl ? Number(data.leftEyeCyl) : null,
      left_eye_axe: data.leftEyeAxe ? Number(data.leftEyeAxe) : null,
      add_value: data.addValue ? Number(data.addValue) : null,
      balance: selectedReceipt.total - Number(data.advancePayment)
    };
    
    const result = await updateReceipt(selectedReceipt.id, updatedFields);
    setIsLoading(false);
    
    if (result) {
      loadReceipts();
      setIsEditDialogOpen(false);
    }
  };

  const getStatusColor = (status) => {
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
                      <TableCell className="font-medium">#{receipt.id.substring(0,8)}</TableCell>
                      <TableCell>{receipt.clientName}</TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          defaultValue={new Date(receipt.date).toISOString().split('T')[0]}
                          onBlur={async (e) => {
                            const success = await updateReceipt(receipt.id, { created_at: e.target.value });
                            if (success) {
                              loadReceipts();
                              toast.success('Date updated successfully');
                            }
                          }}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="text-right">{receipt.total.toFixed(2)} DH</TableCell>
                      <TableCell>{receipt.advancePayment.toFixed(2)} DH</TableCell>
                      <TableCell>{receipt.balance.toFixed(2)} DH</TableCell>
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
                            onClick={() => handleEditReceipt(receipt.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive/80" 
                            onClick={() => handleDeleteReceipt(receipt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* View Receipt Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Receipt #{selectedReceipt ? selectedReceipt.id.substring(0,8) : ''}</DialogTitle>
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
                  <div className="flex justify-center items-center py-2 border-t border-b border-muted mt-4">
                    <div>
                      <span className="text-muted-foreground font-medium">ADD:</span>{" "}
                      <span className="font-medium">{selectedReceipt.prescription.add}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReceipt.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">DH{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">DH{item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Summary</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <dl className="divide-y">
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium">Subtotal</dt>
                        <dd className="text-sm font-medium">DH{selectedReceipt.subtotal.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium">Tax</dt>
                        <dd className="text-sm font-medium">DH{selectedReceipt.tax.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium">Discount</dt>
                        <dd className="text-sm font-medium">DH{selectedReceipt.discount.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium">Total</dt>
                        <dd className="text-sm font-medium">DH{selectedReceipt.total.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm font-medium">Advance Payment</dt>
                        <dd className="text-sm font-medium">DH{selectedReceipt.advancePayment.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <dt>Balance Due</dt>
                        <dd>DH{selectedReceipt.balance.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleEditReceipt(selectedReceipt.id)} 
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handlePrintReceipt(selectedReceipt.id)} 
                    className="gap-1"
                  >
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadReceipt(selectedReceipt.id)} 
                    className="gap-1"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Receipt Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Receipt</DialogTitle>
            </DialogHeader>

            {selectedReceipt && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="rightEyeSph"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Right Eye SPH</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="rightEyeCyl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Right Eye CYL</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="rightEyeAxe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Right Eye AXE</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="leftEyeSph"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Left Eye SPH</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="leftEyeCyl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Left Eye CYL</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="leftEyeAxe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Left Eye AXE</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="addValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ADD Value</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="advancePayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Payment</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              max={selectedReceipt.total} 
                              step="0.01" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Delete Receipt
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p>Are you sure you want to delete this receipt? This action cannot be undone.</p>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Receipt"}
              </Button>
            </DialogFooter>
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
    date: receipt.created_at,
    total: receipt.total || 0,
    advancePayment: receipt.advance_payment || 0,
    balance: receipt.balance || 0,
    status: receipt.balance === 0 ? "Paid" : receipt.advance_payment > 0 ? "Partially Paid" : "Unpaid"
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};




const getReceiptDetails = async (receiptId) => {
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
                custom_item_name,
                products (
                    name
                )
            )
        `)
        .eq('id', receiptId)
        .single();

    if (receiptError) throw receiptError;

    const items = receipt.receipt_items.map(item => ({
        name: item.products?.name || (item.custom_item_name || 'Unknown Item'),
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
            },
            add: receipt.add_value?.toString() || "0"
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
