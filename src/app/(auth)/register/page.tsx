'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerUser } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
      {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function RegisterPage() {
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    const res = await registerUser(formData);
    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else if (res?.success) {
      setMessage({ type: 'success', text: res.success });
      // You could also redirect to login here instead of showing a message
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Enter your details below to create your account and get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={clientAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="bg-white dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-white dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-400"
              />
              <Label htmlFor="isAdmin" className="text-sm font-medium leading-none cursor-pointer select-none">
                Register as Administrator
              </Label>
            </div>
            
            {message && (
              <div
                className={`p-3 text-sm rounded-md border ${
                  message.type === 'error'
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900'
                    : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900'
                }`}
              >
                {message.text}
              </div>
            )}

            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
