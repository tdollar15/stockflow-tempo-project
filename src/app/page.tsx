"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  BoxIcon,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate checking authentication status
  useEffect(() => {
    // In a real app, you would check for a valid session/token here
    const checkAuth = () => {
      // For demo purposes, we're just using a timeout
      // In production, this would be an actual auth check
      const hasSession = localStorage.getItem("stockflowpro_session");
      setIsAuthenticated(!!hasSession);
    };

    checkAuth();
  }, []);

  const handleLogin = (data: {
    email: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);

    // Simulate authentication process
    setTimeout(() => {
      // Store a demo session
      localStorage.setItem(
        "stockflowpro_session",
        JSON.stringify({
          user: {
            email: data.email,
            role: data.role,
          },
          expiresAt: Date.now() + 3600000, // 1 hour from now
        }),
      );

      setIsLoading(false);
      setIsAuthenticated(true);
      router.push("/dashboard");
    }, 1500);
  };

  // If already authenticated, show welcome screen with redirect options
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Welcome to StockFlowPro
          </h1>
          <p className="text-lg text-muted-foreground">
            Your comprehensive inventory management solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            {
              title: "Dashboard",
              description: "View your personalized dashboard",
              icon: <BarChart3 className="h-6 w-6" />,
              path: "/dashboard",
            },
            {
              title: "Inventory",
              description: "Manage your inventory items",
              icon: <BoxIcon className="h-6 w-6" />,
              path: "/inventory",
            },
            {
              title: "Transactions",
              description: "View and create transactions",
              icon: <ClipboardList className="h-6 w-6" />,
              path: "/transactions",
            },
            {
              title: "Approvals",
              description: "Review pending approvals",
              icon: <ShieldCheck className="h-6 w-6" />,
              path: "/approvals",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="backdrop-blur-md bg-white bg-opacity-10 border border-gray-200 border-opacity-20 shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <Button
                  onClick={() => router.push(item.path)}
                  className="w-full transition-transform hover:scale-105 active:scale-95"
                  variant="outline"
                >
                  Go to {item.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => {
            localStorage.removeItem("stockflowpro_session");
            setIsAuthenticated(false);
          }}
          variant="ghost"
          className="mt-8"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  // If not authenticated, show login form
  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
