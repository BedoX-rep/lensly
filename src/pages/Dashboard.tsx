
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, Receipt, Package, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";

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

const RecentActivityCard = () => (
  <Card className="col-span-full hover-transition">
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Your latest transactions and clients</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">New receipt for John Doe</p>
              <p className="text-sm text-muted-foreground">10 minutes ago</p>
            </div>
          </div>
          <p className="font-semibold">$245.00</p>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <ArrowUpFromLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Added new product: Premium Eyeglasses</p>
              <p className="text-sm text-muted-foreground">1 hour ago</p>
            </div>
          </div>
          <p className="font-semibold">$120.00</p>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">New client: Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">3 hours ago</p>
            </div>
          </div>
          <p className="font-semibold">-</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
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
            value="$12,456.00" 
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            description="Up 12% from last month" 
          />
          <StatCard 
            title="Active Clients" 
            value="126" 
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="23 new this month" 
          />
          <StatCard 
            title="Receipts Issued" 
            value="214" 
            icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
            description="18 in the last 7 days" 
          />
          <StatCard 
            title="Products" 
            value="48" 
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            description="4 added recently" 
          />
        </div>
        
        <div className="grid gap-4 grid-cols-1">
          <RecentActivityCard />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
