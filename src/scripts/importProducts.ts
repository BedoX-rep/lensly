
import { supabase } from '../integrations/supabase/client';
import productsData from '../../attached_assets/products.json';

async function importProducts() {
  console.log('Starting product import...');
  
  const { data, error } = await supabase
    .from('products')
    .insert(productsData);
    
  if (error) {
    console.error('Error importing products:', error);
    return;
  }
  
  console.log('Successfully imported all products');
}

importProducts();
</new_str>
