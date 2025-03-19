import { Navbar } from "./Navbar";
import { Link } from "react-router-dom";
import { Button } from "./Button"; // Assumed import
import { FileText } from "@heroicons/react/24/solid"; // Assumed import - adjust as needed

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-container py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;