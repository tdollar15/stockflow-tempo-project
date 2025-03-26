"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../auth/LoginForm";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children = null }: AuthLayoutProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate authentication check
  useEffect(() => {
    // In a real app, this would check for a valid session/token
    const checkAuth = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if user is logged in (e.g., from localStorage or cookies)
        const userSession = localStorage.getItem("userSession");
        setIsAuthenticated(!!userSession);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login submission
  const handleLogin = async (data: {
    email: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store user session (in a real app, this would be a token from the backend)
      const userSession = {
        email: data.email,
        role: data.role,
        token: "mock-jwt-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };

      localStorage.setItem("userSession", JSON.stringify(userSession));
      setIsAuthenticated(true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
  }

  // Show children (protected content) if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {children}
    </div>
  );
};

export default AuthLayout;
