"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/redux/api/userApi";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [registerUser] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      role: "customer"
    }
  });

  const onSubmit = async (data) => {
    clearErrors("root");
    setLoading(true);
    try {
      if (isLogin) {
        // Login Logic
        console.log("Attempting login...");
        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (res.error) {
          console.error("Login error:", res.error);
          setError("root", { message: res.error });
        } else {
          console.log("Login successful, checking status...");
          const session = await getSession();
          const status = session?.user?.status?.toLowerCase();

          if (status === "pending" || status === "rejected") {
            router.push("/dashboard/profile");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }
      } else {
        // Register Logic using Redux Mutation
        console.log("Attempting registration via Redux API...");
        try {
          await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role
          }).unwrap();

          console.log("Registration successful, attempting auto-login...");
          const loginRes = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });

          if (loginRes.error) {
            setError("root", { message: "Registered but auto-login failed: " + loginRes.error });
            setIsLogin(true);
          } else {
            console.log("Auto-login successful, checking status...");
            const session = await getSession();
            const status = session?.user?.status?.toLowerCase();

            if (status === "pending" || status === "rejected") {
              router.push("/dashboard/profile");
            } else {
              router.push("/dashboard");
            }
            router.refresh();
          }
        } catch (err) {
          throw new Error(err.data || err.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("root", { message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const onErrors = (err) => {
    console.log("Form validation errors:", err);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <Card className="w-full max-w-md">

        <CardHeader className="space-y-4">

          {/* Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 rounded-md text-sm ${isLogin ? "bg-background shadow" : ""
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 rounded-md text-sm ${!isLogin ? "bg-background shadow" : ""
                }`}
            >
              Sign Up
            </button>
          </div>

          <CardTitle className="text-center text-2xl">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, onErrors)} className="space-y-4" noValidate>

            {/* Global Error Display */}
            {errors.root && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in duration-300">
                {errors.root.message}
              </div>
            )}

            {/* Name (Signup only) */}
            {!isLogin && (
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="John Doe"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            {/* Role (Signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label>Join as</Label>
                <div className="flex gap-6 items-center pt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="customer"
                      value="customer"
                      {...register("role", { required: "Please select a role" })}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="customer" className="font-medium cursor-pointer">Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="employee"
                      value="employee"
                      {...register("role", { required: "Please select a role" })}
                      className="h-4 w-4 accent-primary cursor-pointer"
                    />
                    <Label htmlFor="employee" className="font-medium cursor-pointer">Employee</Label>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-500">
                    {errors.role.message}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="example@email.com"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  placeholder="••••••••"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          {/* Switch */}
          <p className="text-sm text-center text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary cursor-pointer"
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}