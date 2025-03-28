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
import { supabase } from "@/lib/supabase-client";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Fetch roles from Supabase
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Fetch roles from Supabase roles table
        const { data, error } = await supabase.from('roles').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setRoles(data.map(r => ({ id: r.id, name: r.name })));
        }
      } catch (error: any) {
        console.error("Error fetching roles:", error);
        toast({
          title: "Error",
          description: "Failed to load user roles. Using default roles.",
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
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      if (profileError) throw profileError;

      // Use the role from the database or fallback to the selected role
      const userRole = profileData?.role || role;

      // Store session in localStorage for persistence
      localStorage.setItem('supabase_session', JSON.stringify(data.session));

      // Call onSubmit with user data
      onSubmit({ 
        email, 
        password, 
        role: userRole 
      });

      // Redirect to dashboard or home page
      router.push('/dashboard');

      toast({
        title: "Login Successful",
        description: `Welcome, ${userRole}!`,
        variant: "default",
      });
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
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button 
            variant="link" 
            onClick={() => router.push('/forgot-password')}
          >
            Forgot Password?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
