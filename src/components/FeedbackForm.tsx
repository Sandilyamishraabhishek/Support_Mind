'use client';

import { useState, useTransition } from 'react';
import { submitFeedback } from '@/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, SendHorizontal, AlertCircle, CheckCircle } from 'lucide-react';

export function FeedbackForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || title.trim().length < 5) {
      setMessage({ type: 'error', text: 'Title must be at least 5 characters long.' });
      return;
    }
    if (!description || description.trim().length < 10) {
      setMessage({ type: 'error', text: 'Description must be at least 10 characters long.' });
      return;
    }

    startTransition(async () => {
      const res = await submitFeedback(formData);
      if (res?.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res?.success) {
        setMessage({ type: 'success', text: res.success });
        // Reset the form inputs
        const form = document.getElementById('feedback-form') as HTMLFormElement;
        if (form) form.reset();
      }
    });
  }

  return (
    <Card className="w-full border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm backdrop-blur-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span>Submit Feedback</span>
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Share bugs, complaints, or feature requests. Gemini AI will analyze it instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="feedback-form" action={clientAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., App crashes on login or Add dark mode"
              required
              disabled={isPending}
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-500"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide as much detail as possible. Write the steps to reproduce for bugs, or explain why you need a feature."
              required
              disabled={isPending}
              className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950"
            />
          </div>

          {message && (
            <div
              className={`p-3 text-sm rounded-lg flex items-start gap-2 border ${
                message.type === 'error'
                  ? 'text-red-500 bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/50'
                  : 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting to AI Triaging...</span>
              </>
            ) : (
              <>
                <SendHorizontal className="h-4 w-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
