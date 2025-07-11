import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function DashboardHeader({ userEmail, onLogout }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Business Directory
              </h1>
              <p className="text-xs text-slate-500">
                Smart data extraction & analysis
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {userEmail}
            </Badge>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
