
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
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize useToast
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
      // Fetch admin user by email from the custom 'admins' table
      const { data: adminUser, error: fetchError } = await supabase
        .from('admins')
        .select('email, hashed_password') // We select hashed_password to acknowledge its existence
        .eq('email', data.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "Searched item was not found" / No rows returned
        console.error("Supabase fetch admin error:", fetchError);
        setLoginError(fetchError.message || "Error fetching admin details. Check console.");
        toast({
          title: "Login Error",
          description: fetchError.message || "Could not fetch admin details.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (adminUser) {
        // IMPORTANT: Server-Side Password Verification Needed for Production!
        // The following is a PROTOTYPE-ONLY simulation.
        // In a real app, you MUST send `data.password` (the plain text password)
        // and `adminUser.hashed_password` to a Supabase Edge Function.
        // That Edge Function would then use a library like 'bcryptjs' to securely compare them:
        // `const isValid = await bcrypt.compare(plainTextPassword, hashedPasswordFromDb);`
        // Only if `isValid` is true should you proceed with creating a session or redirecting.
        //
        // For this prototype, we'll assume the password is correct if the email exists in 'admins' table.
        console.log("Admin email found, PROTOTYPE login successful for:", adminUser.email);
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
          <p>Login checks email existence in 'admins' table. Password is not verified for this prototype. See code comments for production requirements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
