
import { supabase } from '../integrations/supabase/client';
import productsData from '../../attached_assets/products.json';

async function importProducts() {
  console.log('Starting product import...');
  
  for (const product of productsData) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        price: product.price
      }]);
      
    if (error) {
      console.error(`Error importing ${product.name}:`, error);
    } else {
      console.log(`Imported: ${product.name}`);
    }
  }
  
  console.log('Import completed');
}

importProducts();
