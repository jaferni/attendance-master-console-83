
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { user, login, isLoading } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await login(values.email, values.password);
    setIsSubmitting(false);
  };

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/50 p-4">
      <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EduTrack</h1>
          <p className="text-muted-foreground mt-1">School Management System</p>
        </div>

        <Card className="w-full glass glass-hover">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@school.edu"
                          type="email"
                          {...field}
                        />
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
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>For demo purposes:</strong> Use any of these emails with any
                    password:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>
                      <span className="font-mono text-primary">
                        david.anderson@school.edu
                      </span>{" "}
                      (Super Admin)
                    </li>
                    <li>
                      <span className="font-mono text-primary">
                        emma.thompson@school.edu
                      </span>{" "}
                      (Teacher)
                    </li>
                    <li>
                      <span className="font-mono text-primary">
                        alex.johnson@school.edu
                      </span>{" "}
                      (Student)
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting || isLoading}
                >
                  {(isSubmitting || isLoading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
