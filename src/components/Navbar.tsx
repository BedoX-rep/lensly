
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "px-4 py-2 rounded-md transition-all duration-300 ease-in-out text-sm font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-semibold tracking-tight">
              LensLy
            </Link>
          </div>
          
          <nav className="flex items-center gap-1 md:gap-2">
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/products">Products</NavItem>
            <NavItem to="/clients">Clients</NavItem>
            <NavItem to="/receipts">Receipts</NavItem>
            <NavItem to="/receipt/new">New Receipt</NavItem>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
