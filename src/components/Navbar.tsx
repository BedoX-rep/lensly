
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Eye, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="flex items-center gap-6">
        <NavItem to="/">Dashboard</NavItem>
        <NavItem to="/products">Products</NavItem>
        <NavItem to="/clients">Clients</NavItem>
        <NavItem to="/receipts">Receipts</NavItem>
      </div>
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
      </Button>
    </nav>
  );
};

export default Navbar;

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
