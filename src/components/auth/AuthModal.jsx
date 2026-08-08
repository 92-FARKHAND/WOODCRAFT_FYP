"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  // Runs after useForm exists now — trigger is defined
  useEffect(() => {
    trigger();
  }, [trigger, isLogin]);

  const onSubmit = async (data) => {
    clearErrors("root");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (res.error) {
          setError("root", { message: res.error });
        } else {
          onClose();
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Registration failed");
        }

        const loginRes = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (loginRes.error) {
          setError("root", { message: "Registered but auto-login failed: " + loginRes.error });
          setIsLogin(true);
        } else {
          onClose();
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      setError("root", { message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md relative shadow-2xl scale-in-95 animate-in fade-in zoom-in-95 duration-300 border-primary/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>

        <CardHeader className="space-y-4 pt-8">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                clearErrors();
                reset();
              }}
              className={`w-1/2 py-2 rounded-md text-sm font-medium transition-all ${
                isLogin ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                clearErrors();
                reset();
              }}
              className={`w-1/2 py-2 rounded-md text-sm font-medium transition-all ${
                !isLogin ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <CardTitle className="text-center text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {errors.root && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in-95 duration-300">
                {errors.root.message}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  {...register("name", { required: "Name is required",
                    minLength: { value: 3, message: "Minimum 3 characters" }
                   })}
                  placeholder="John Doe"
                  className="rounded-xl"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="text"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="example@email.com"
                className="rounded-xl"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                placeholder="••••••••"
                className="rounded-xl"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (val) =>
                      watch("password") === val || "Your passwords do not match",
                  })}
                  placeholder="••••••••"
                  className="rounded-xl"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            <Button
              className="w-full py-6 text-lg rounded-xl mt-4"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                clearErrors();
                reset();
              }}
              className="ml-1 text-primary font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}