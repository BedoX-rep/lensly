
import { supabase } from '../integrations/supabase/client';
import products from '../../attached_assets/products.json';

async function importProducts() {
  try {
    console.log('Starting product import...');
    
    // Using upsert to avoid duplicates
    const { data, error } = await supabase
      .from('products')
      .upsert(
        products.map(product => ({
          name: product.name,
          price: product.price
        })),
        { onConflict: 'name' }
      );

    if (error) {
      throw error;
    }

    console.log('Successfully imported all products');
  } catch (error) {
    console.error('Error importing products:', error);
  }
}

// Run the import
importProducts();
