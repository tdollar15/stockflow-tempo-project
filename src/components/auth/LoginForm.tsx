"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { signIn } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string; role: string }) => void;
  isLoading?: boolean;
}

const LoginForm = ({
  onSubmit = () => {},
  isLoading: externalIsLoading = false,
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("clerk");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(externalIsLoading);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([
    { id: "admin", name: "Admin" },
    { id: "supervisor", name: "Supervisor" },
    { id: "storeman", name: "Storeman" },
    { id: "clerk", name: "Clerk" },
    { id: "supplier_driver", name: "Supplier Driver" },
    { id: "supplier_supervisor", name: "Supplier Supervisor" },
  ]);
  const { toast } = useToast();

  // Fetch roles from Supabase
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // In a real implementation, you would fetch roles from Supabase
        // For now, we'll use the hardcoded roles above
        // const { data } = await supabase.from('roles').select('*');
        // if (data) setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to load user roles. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchRoles();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, we would use Supabase Auth
      // const { user } = await signIn(email, password);
      // if (user) {
      //   // Get user role from the users table
      //   const { data: userData } = await supabase
      //     .from('users')
      //     .select('role')
      //     .eq('id', user.id)
      //     .single();
      //
      //   // Use the role from the database or fallback to the selected role
      //   const userRole = userData?.role || role;
      //   onSubmit({ email, password, role: userRole });
      // }

      // For now, we'll just pass the selected role
      onSubmit({ email, password, role });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md backdrop-blur-md bg-white bg-opacity-10 border border-gray-200 border-opacity-20 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            StockFlowPro
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="pl-10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleOption) => (
                      <SelectItem key={roleOption.id} value={roleOption.id}>
                        {roleOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            <a
              href="#"
              className="hover:text-primary underline underline-offset-4"
            >
              Forgot password?
            </a>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account? Contact your administrator
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
