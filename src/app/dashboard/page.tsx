import { auth } from '@/auth';
import { logoutUser } from '@/actions/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FeedbackForm } from '@/components/FeedbackForm';
import { Sparkles, LogOut, MessageSquarePlus, Clock, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch feedbacks submitted by this user
  const feedbacks = await prisma.feedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Helpers to render status badges
  function getStatusStyle(status: string) {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
      default: // NEW
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'IN_PROGRESS':
        return <Clock className="w-3.5 h-3.5 shrink-0" />;
      case 'RESOLVED':
        return <CheckCircle className="w-3.5 h-3.5 shrink-0" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 shrink-0" />;
    }
  }

  function getCategoryLabel(category: string | null) {
    if (!category) return 'OTHER';
    return category.replace('_', ' ');
  }

  function getSentimentEmoji(sentiment: string | null) {
    switch (sentiment) {
      case 'POSITIVE':
        return '😊';
      case 'NEGATIVE':
        return '😠';
      case 'NEUTRAL':
      default:
        return '😐';
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      {/* Top Header Navbar */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
            <span>SupportMind</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 ml-2">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold">{session.user.name || 'Customer'}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{session.user.email}</span>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid md:grid-cols-5 gap-8">
        {/* Left Column - Submission Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-zinc-500" />
            <h2 className="text-lg font-bold tracking-tight">New Feedback</h2>
          </div>
          <FeedbackForm />
        </div>

        {/* Right Column - Submissions History */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-bold tracking-tight">Your Submission History</h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-2 py-0.5 rounded-full">
              {feedbacks.length} submitted
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center min-h-[300px]">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 mb-4 border border-zinc-200 dark:border-zinc-800">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base">No feedback found</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                You haven't submitted any feedback yet. Use the form on the left to start!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-base line-clamp-1">{feedback.title}</h3>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusStyle(
                        feedback.status
                      )}`}
                    >
                      {getStatusIcon(feedback.status)}
                      <span className="text-[10px] tracking-wide uppercase">
                        {feedback.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3">
                    {feedback.description}
                  </p>

                  {/* AI triaging results preview */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium tracking-wider uppercase text-[10px]">
                      {getCategoryLabel(feedback.category)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      Sentiment: <span className="font-medium text-zinc-800 dark:text-zinc-200">{getSentimentEmoji(feedback.sentiment)}</span>
                    </span>

                    <span className="text-zinc-400 dark:text-zinc-600">•</span>

                    <span className="text-zinc-500 dark:text-zinc-400">
                      Submitted on {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {feedback.summary && (
                    <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 text-xs flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-zinc-500 mr-1.5 uppercase text-[9px] tracking-wider">
                          AI Summary:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 italic">
                          "{feedback.summary}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
