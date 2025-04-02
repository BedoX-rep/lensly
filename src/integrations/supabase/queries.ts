import { supabase } from "./client";
import { toast } from "sonner";

// Product queries
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    toast.error('Failed to load products');
    return [];
  }

  return data || [];
}

export async function addProduct(name: string, price: number) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, price }])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    toast.error('Failed to add product');
    return null;
  }

  toast.success(`Product ${name} added successfully`);
  return data;
}

export async function updateProduct(id: string, name: string, price: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ name, price })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
    return null;
  }

  toast.success(`Product ${name} updated successfully`);
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    toast.error('Failed to delete product');
    return false;
  }

  toast.success('Product deleted successfully');
  return true;
}

// Client queries
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    toast.error('Failed to load clients');
    return [];
  }

  return data || [];
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    toast.error('Failed to load client');
    return null;
  }

  return data;
}

export async function addClient(name: string, phone: string) {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ name, phone }])
    .select()
    .single();

  if (error) {
    console.error('Error adding client:', error);
    toast.error('Failed to add client');
    return null;
  }

  toast.success(`Client ${name} added successfully`);
  return data;
}

export async function updateClient(id: string, name: string, phone: string) {
  const { data, error } = await supabase
    .from('clients')
    .update({ name, phone })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    toast.error('Failed to update client');
    return null;
  }

  toast.success(`Client ${name} updated successfully`);
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    toast.error('Failed to delete client');
    return false;
  }

  toast.success('Client deleted successfully');
  return true;
}

// Receipt queries
export async function getReceipts() {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      clients (name, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching receipts:', error);
    toast.error('Failed to load receipts');
    return [];
  }

  return data || [];
}

export async function getReceiptById(id: string) {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      clients (name, phone)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching receipt:', error);
    toast.error('Failed to load receipt');
    return null;
  }

  return data;
}

export async function getReceiptItems(receiptId: string) {
  const { data, error } = await supabase
    .from('receipt_items')
    .select(`
      *,
      products (name)
    `)
    .eq('receipt_id', receiptId);

  if (error) {
    console.error('Error fetching receipt items:', error);
    toast.error('Failed to load receipt items');
    return [];
  }

  return data || [];
}

export async function getClientReceipts(clientId: string) {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client receipts:', error);
    toast.error('Failed to load client receipts');
    return [];
  }

  return data || [];
}

export async function createReceipt(receipt: any, items: any[]) {
  // Make sure we're using the current timestamp
  receipt.created_at = new Date().toISOString();

  // Start a transaction
  const { data: receiptData, error: receiptError } = await supabase
    .from('receipts')
    .insert([receipt])
    .select()
    .single();

  if (receiptError) {
    console.error('Error creating receipt:', receiptError);
    toast.error('Failed to create receipt');
    return null;
  }

  // Add receipt ID to items
  const itemsWithReceiptId = items.map(item => ({
    ...item,
    receipt_id: receiptData.id
  }));

  // Insert items
  const { error: itemsError } = await supabase
    .from('receipt_items')
    .insert(itemsWithReceiptId);

  if (itemsError) {
    console.error('Error adding receipt items:', itemsError);
    toast.error('Failed to add receipt items');
    return null;
  }

  toast.success('Receipt created successfully');
  return receiptData;
}

export async function updateReceipt(id: string, updatedFields: any) {
  const { data, error } = await supabase
    .from('receipts')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating receipt:', error);
    toast.error('Failed to update receipt');
    return null;
  }

  toast.success('Receipt updated successfully');
  return data;
}

export async function updateReceiptPaymentStatus(id: string) {
  // First get the receipt to determine the total
  const { data: receipt, error: fetchError } = await supabase
    .from('receipts')
    .select('total')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching receipt for payment update:', fetchError);
    toast.error('Failed to update payment status');
    return null;
  }

  // Update the receipt to set advance_payment to total (making it fully paid)
  const { data, error } = await supabase
    .from('receipts')
    .update({ 
      advance_payment: receipt.total,
      balance: 0 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment status:', error);
    toast.error('Failed to update payment status');
    return null;
  }

  toast.success('Payment status updated to Paid');
  return data;
}

export async function toggleDeliveryStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'Delivered' ? 'Undelivered' : 'Delivered';

  const { data, error } = await supabase
    .from('receipts')
    .update({ delivery_status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating delivery status:', error);
    toast.error('Failed to update delivery status');
    return null;
  }

  toast.success(`Delivery status updated to ${newStatus}`);
  return data;
}

export async function deleteReceipt(id: string) {
  // First delete all receipt items
  const { error: itemsError } = await supabase
    .from('receipt_items')
    .delete()
    .eq('receipt_id', id);

  if (itemsError) {
    console.error('Error deleting receipt items:', itemsError);
    toast.error('Failed to delete receipt items');
    return false;
  }

  // Then delete the receipt
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting receipt:', error);
    toast.error('Failed to delete receipt');
    return false;
  }

  toast.success('Receipt deleted successfully');
  return true;
}

export async function updateProductPosition(id: string, newPosition: number) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, position')
      .order('position');

    if (error) {
        console.error("Error fetching products for position update:", error);
        return false;
    }

    if (!products) return false;

    const draggedProductIndex = products.findIndex(p => p.id === id);
    if (draggedProductIndex === -1) return false;

    const { data: updatedProducts, error: updateError } = await supabase.rpc('update_positions', {
      moved_id: id,
      new_pos: newPosition + 1
    });

    if (updateError) {
      console.error("Error updating product positions:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProductPosition:', error);
    return false;
  }
}

// Format date with time in Casablanca timezone (UTC+1)
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  // Convert to Morocco/Casablanca time (UTC+1)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Casablanca'
  }).format(date);
}

// Format date only
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  // Convert to Morocco/Casablanca time (UTC+1)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Africa/Casablanca'
  }).format(date);
}