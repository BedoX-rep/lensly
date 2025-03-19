
import { supabase } from "./client";
import { toast } from "sonner";

// Product queries
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });
  
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
