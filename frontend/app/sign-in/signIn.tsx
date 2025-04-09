"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Alert from '@/components/ui/Alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { log } from 'console'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignIn() {
  const router = useRouter()
  const { signIn, isLoading, error, setError } = useAuth()
  const [localError, setLocalError] = React.useState<string>('')
  const errorTimerId = React.useRef<NodeJS.Timeout | null>(null)

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const clearErrorTimer = () => {
    if (errorTimerId.current) {
      clearTimeout(errorTimerId.current)
      errorTimerId.current = null
    }
  }

  const startErrorTimer = () => {
    clearErrorTimer()
    errorTimerId.current = setTimeout(() => {
      setError(null)
      setLocalError('')
    }, 5000)
  }

  useEffect(() => {
    if (error || localError) {
      startErrorTimer()
    }
    return clearErrorTimer
  }, [error, localError, setError])

  const onSubmit = async (data: SignInForm) => {
    try {
      setLocalError('')
      const response = await signIn(data)
      if (response) {
        router.push('/users/posts')
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Sign in error occurred')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
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

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <Alert
          type="error"
          message={error || localError}
          isShown={!!(error || localError)}
          onClose={() => {
            clearErrorTimer()
            setError(null)
            setLocalError('')
          }}
        />
      </div>
    </div>
  )
}

