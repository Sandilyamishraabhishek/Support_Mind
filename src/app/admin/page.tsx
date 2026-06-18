import { auth } from '@/auth';
import { LogoutButton } from '@/components/LogoutButton';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminFeedbackTable } from '@/components/AdminFeedbackTable';
import {
  Sparkles,
  FolderTree,
  AlertTriangle,
  Smile,
  BarChart3,
  Inbox,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    priority?: string;
    sentiment?: string;
    status?: string;
  }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await auth();

  // Route protection
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Await search parameters (Next.js 15/16 App Router standard)
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const category = resolvedParams.category || '';
  const priority = resolvedParams.priority || '';
  const sentiment = resolvedParams.sentiment || '';
  const status = resolvedParams.status || '';

  // Construct search query
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (sentiment) where.sentiment = sentiment;
  if (status) where.status = status;

  // Retrieve feedbacks
  const feedbacks = await prisma.feedback.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate statistics across ALL feedbacks
  const allFeedbacks = await prisma.feedback.findMany();
  const totalCount = allFeedbacks.length;
  
  const pendingBugs = allFeedbacks.filter(
    (f) => f.category === 'BUG' && (f.status === 'NEW' || f.status === 'IN_PROGRESS')
  ).length;

  const highPriority = allFeedbacks.filter((f) => f.priority === 'HIGH').length;
  
  const negativeSentiment = allFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;

  // Category counts calculations
  const categories = ['BUG', 'COMPLAINT', 'SUGGESTION', 'FEATURE_REQUEST', 'OTHER'];
  const categoryColors = {
    BUG: 'bg-rose-500 dark:bg-rose-600',
    COMPLAINT: 'bg-orange-500 dark:bg-orange-600',
    SUGGESTION: 'bg-amber-500 dark:bg-amber-600',
    FEATURE_REQUEST: 'bg-indigo-500 dark:bg-indigo-600',
    OTHER: 'bg-zinc-500 dark:bg-zinc-650',
  } as any;

  const categoryCounts = categories.map((cat) => {
    const count = allFeedbacks.filter((f) => f.category === cat).length;
    return {
      key: cat,
      name: cat.replace('_', ' '),
      count,
      color: categoryColors[cat] || 'bg-zinc-500',
    };
  });
  const maxCategoryCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  // Sentiment counts calculations
  const positiveCount = allFeedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
  const neutralCount = allFeedbacks.filter((f) => f.sentiment === 'NEUTRAL').length;
  const negativeCount = allFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;
  const totalSentimentCount = positiveCount + neutralCount + negativeCount || 1;

  const posPercent = Math.round((positiveCount / totalSentimentCount) * 100);
  const neuPercent = Math.round((neutralCount / totalSentimentCount) * 100);
  const negPercent = 100 - posPercent - neuPercent;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      {/* Admin Header Navbar */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
            <span>SupportMind</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 ml-2">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold">{session.user.name || 'Administrator'}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{session.user.email}</span>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Title and stats summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Feedback Dashboard</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Overview of all triaged submissions, AI categorization, and sentiment analytics.
            </p>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total feedbacks */}
          <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-950 dark:text-zinc-50 border border-zinc-200/50 dark:border-zinc-800">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Feedbacks</div>
              <div className="text-2xl font-bold">{totalCount}</div>
            </div>
          </div>

          {/* Card 2: Pending Bugs */}
          <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Bugs</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-455">{pendingBugs}</div>
            </div>
          </div>

          {/* Card 3: High Priority */}
          <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">High Priority</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-450">{highPriority}</div>
            </div>
          </div>

          {/* Card 4: Negative Sentiment */}
          <div className="p-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50">
              <Smile className="w-5 h-5 rotate-180" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Negative Sentiment</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-455">{negativeSentiment}</div>
            </div>
          </div>
        </div>

        {/* Charts & Visualization Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card: Feedback by Category Chart */}
          <div className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <FolderTree className="w-4 h-4 text-zinc-500" />
              <h3 className="font-bold text-sm tracking-tight">Feedback by Category</h3>
            </div>

            <div className="space-y-4">
              {categoryCounts.map((cat) => {
                const percentage = totalCount > 0 ? Math.round((cat.count / totalCount) * 100) : 0;
                const fillWidth = Math.round((cat.count / maxCategoryCount) * 100);

                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400 capitalize">
                        {cat.name.toLowerCase()}
                      </span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {cat.count} <span className="text-[10px] text-zinc-500 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        style={{ width: `${fillWidth}%` }}
                        className={`h-full ${cat.color} rounded-full transition-all duration-700 ease-out`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Sentiment Analytics Chart */}
          <div className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-sm tracking-tight">Customer Sentiment Distribution</h3>
              </div>
              <div className="text-xs text-zinc-500 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>AI Classified</span>
              </div>
            </div>

            <div className="space-y-8 my-auto">
              {/* Stacked Sentiment Gauge Bar */}
              <div className="space-y-2">
                <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner border border-zinc-200/20">
                  {positiveCount > 0 && (
                    <div
                      style={{ width: `${posPercent}%` }}
                      className="h-full bg-emerald-500 dark:bg-emerald-600 hover:opacity-90 transition-all duration-700"
                      title={`Positive: ${positiveCount}`}
                    />
                  )}
                  {neutralCount > 0 && (
                    <div
                      style={{ width: `${neuPercent}%` }}
                      className="h-full bg-zinc-400 dark:bg-zinc-600 hover:opacity-90 transition-all duration-700"
                      title={`Neutral: ${neutralCount}`}
                    />
                  )}
                  {negativeCount > 0 && (
                    <div
                      style={{ width: `${negPercent}%` }}
                      className="h-full bg-rose-500 dark:bg-rose-600 hover:opacity-90 transition-all duration-700"
                      title={`Negative: ${negativeCount}`}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-0.5">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Legends with detail */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Positive legend */}
                <div className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-850/80 bg-zinc-50/30 dark:bg-zinc-950/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-450">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Positive</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{positiveCount}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{posPercent}%</div>
                </div>

                {/* Neutral legend */}
                <div className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-850/80 bg-zinc-50/30 dark:bg-zinc-950/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-zinc-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-zinc-450 shrink-0" />
                    <span>Neutral</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{neutralCount}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{neuPercent}%</div>
                </div>

                {/* Negative legend */}
                <div className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-850/80 bg-zinc-50/30 dark:bg-zinc-950/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-rose-600 dark:text-rose-450">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Negative</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{negativeCount}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{negPercent}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Database Table Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-zinc-500" />
            <h2 className="text-lg font-bold tracking-tight font-sans">Feedback Control Room</h2>
          </div>
          <AdminFeedbackTable feedbacks={feedbacks} />
        </div>
      </main>
    </div>
  );
}
