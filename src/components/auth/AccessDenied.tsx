"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ShieldX, Home } from "lucide-react";

interface AccessDeniedProps {
  message?: string;
  redirectPath?: string;
}

export default function AccessDenied({ 
  message = "You do not have permission to access this page.", 
  redirectPath = "/dashboard" 
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-lg bg-card shadow-lg max-w-md w-full">
        <ShieldX className="mx-auto mb-4 text-destructive" size={64} />
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Access Denied
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link href={redirectPath}>
            <Button variant="default">
              <Home className="mr-2" size={18} />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
