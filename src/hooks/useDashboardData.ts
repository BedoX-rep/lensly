
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardData() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Get total revenue
      const { data: revenue } = await supabase
        .from('receipts')
        .select('total')
        .gt('total', 0);
      
      const totalRevenue = revenue?.reduce((sum, receipt) => sum + (receipt.total || 0), 0) || 0;

      // Get active clients count
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Get receipts count for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get total receipts count
      const { count: totalReceipts } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true });

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      return {
        totalRevenue,
        activeClients: activeClients || 0,
        recentReceipts: recentReceipts || 0,
        totalReceipts: totalReceipts || 0,
        productsCount: productsCount || 0
      };
    }
  });

  return { stats, isLoading: isStatsLoading };
}
