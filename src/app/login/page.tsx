
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  });
  
  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    setIsLoading(true);

    try {
      // Fetch admin user by email from the 'AdminUser' table
      const { data: adminUser, error: fetchError } = await supabase
        .from('AdminUser') 
        .select('email, hashed_password, is_active, role') 
        .eq('email', data.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows returned
        console.error("Supabase fetch admin error occurred. Original error object:", fetchError);
        // Attempt to get more details from the error object
        const message = (fetchError as any).message || "No message property";
        const code = (fetchError as any).code || "No code property";
        const details = (fetchError as any).details || "No details property";
        const hint = (fetchError as any).hint || "No hint property";
        
        console.error(`Detailed Error - Message: ${message}, Code: ${code}, Details: ${details}, Hint: ${hint}`);
        if ((fetchError as any).stack) {
            console.error("Error stack:", (fetchError as any).stack);
        }
        
        const displayErrorMessage = (fetchError as any).message || "Error fetching admin details.";
        setLoginError(displayErrorMessage);
        toast({
          title: "Login Error",
          description: displayErrorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (adminUser) {
        if (!adminUser.is_active) {
          setLoginError("Your account is inactive. Please contact support.");
          toast({
            title: "Login Failed",
            description: "Account is inactive.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // TODO: SERVER-SIDE PASSWORD VERIFICATION REQUIRED FOR PRODUCTION!
        // This is a PROTOTYPE-ONLY simulation.
        // In a real app, you MUST send `data.password` (the plain text password)
        // and `adminUser.hashed_password` to a Supabase Edge Function or a secure backend endpoint.
        // That server-side function would then use a library like 'bcryptjs' to securely compare them:
        // `const isValid = await bcrypt.compare(plainTextPassword, hashedPasswordFromDb);`
        // Only if `isValid` is true should you proceed.
        // For this prototype, we assume the password is correct if the email exists and is active.
        
        console.log("Admin email found, PROTOTYPE login successful for:", adminUser.email, "Role:", adminUser.role);
        
        toast({
          title: "Login Successful (Prototype)",
          description: "Redirecting to dashboard...",
        });
        router.push("/admin/dashboard");

      } else {
        // No admin user found with that email, or PGRST116 error (no rows)
        setLoginError("Invalid email or password.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Login submission error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during login.";
      setLoginError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  console.log("Supabase client initialized on login page:", supabase ? "Yes" : "No");

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-3xl font-bold font-headline">Admin Login</CardTitle>
        <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loginError && (
              <p className="text-sm font-medium text-destructive">{loginError}</p>
            )}
            <Button type="submit" className="w-full !bg-accent hover:!bg-accent/90 !text-accent-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Contact support if you have trouble logging in.
          </p>
        </div>
        <div className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold">PROTOTYPE NOTE:</p>
          <p>Login checks email existence & active status in 'AdminUser' table. Password is NOT securely verified for this prototype. See code comments for production requirements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
