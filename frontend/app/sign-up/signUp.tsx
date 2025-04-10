"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Alert,
  Input,
  Button
} from "@/components/ui";

import { useAuth } from "@/hooks/useAuth";

const signUpSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const { signUp, isLoading, error, setError } = useAuth();
  const [localError, setLocalError] = React.useState<string>("");
  const errorTimerId = React.useRef<NodeJS.Timeout | null>(null);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstname: "",
      lastname: "",
    },
  });

  const clearErrorTimer = () => {
    if (errorTimerId.current) {
      clearTimeout(errorTimerId.current);
      errorTimerId.current = null;
    }
  };

  const startErrorTimer = () => {
    clearErrorTimer();
    errorTimerId.current = setTimeout(() => {
      setError(null);
      setLocalError("");
    }, 5000);
  };

  useEffect(() => {
    if (error || localError) {
      startErrorTimer();
    }
    return clearErrorTimer;
  }, [error, localError, setError]);

  const onSubmit = async (data: SignUpForm) => {
    try {
      setLocalError("");
      const response = await signUp(data);
      if (response) {
        router.push("/users/posts");
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Sign up error occurred"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@mail.com"
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
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        <Alert
          type="error"
          message={error || localError}
          isShown={!!(error || localError)}
          onClose={() => {
            clearErrorTimer();
            setError(null);
            setLocalError("");
          }}
        />
      </div>
    </div>
  );
}
