import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, Receipt, Package } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const StatCard = ({ title, value, icon, description }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}) => (
  <Card className="hover-transition">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <CardDescription>{description}</CardDescription>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { stats, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your optical store
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${stats?.totalRevenue.toFixed(2)}`}
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            description="All time revenue" 
          />
          <StatCard 
            title="Active Clients" 
            value={stats?.activeClients} 
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Total registered clients" 
          />
          <StatCard 
            title="Receipts Issued" 
            value={stats?.totalReceipts} 
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
            description={`${stats?.recentReceipts} in the last 7 days`}
          />
          <StatCard 
            title="Products" 
            value={stats?.productsCount} 
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            description="Total available products" 
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;