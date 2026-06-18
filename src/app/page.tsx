import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ArrowRight, MessageSquare, Shield, Sparkles, Database } from 'lucide-react';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      {/* Navigation */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-50 animate-pulse" />
            <span>SupportMind</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 rounded-lg transition-all shadow-sm duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 rounded-full border border-zinc-200 dark:border-zinc-800 mb-8 animate-bounce">
          <Sparkles className="w-3 h-3" />
          <span>Now Powered by Google Gemini AI</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400">
          Intelligent feedback tracking for modern software teams.
        </h1>

        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mt-6 leading-relaxed">
          Centralize customer complaints, feature requests, and suggestions. SupportMind uses Gemini to instantly triage, analyze sentiment, and summarize feedback.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 rounded-xl transition-all shadow-lg hover:shadow-xl dark:shadow-zinc-900/30 duration-200"
          >
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-200"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
          <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 mb-4 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Instant Customer Portal</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Clean form interface for customers to easily submit bugs, recommendations, and complaints.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 mb-4 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">AI Triaging & Sentiment</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Gemini analyzes each request, generating priorities, sentiments, summaries, and categories.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 mb-4 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Admin Control Room</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Filter by priorities, search feedback texts, change resolution statuses, and view rich charts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900/80 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/30 dark:bg-black/10">
        <p>© {new Date().getFullYear()} SupportMind. All rights reserved. Built for Vibe Coding Assessment.</p>
      </footer>
    </div>
  );
}
