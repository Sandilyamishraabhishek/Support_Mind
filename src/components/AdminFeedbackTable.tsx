'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { updateFeedbackStatus } from '@/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  User,
  Mail,
  Calendar,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: string | null;
  priority: string | null;
  sentiment: string | null;
  summary: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface AdminFeedbackTableProps {
  feedbacks: FeedbackItem[];
}

export function AdminFeedbackTable({ feedbacks }: AdminFeedbackTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Selected feedback for Detail Modal
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper to update query parameters in URL
  const updateQueryParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  // Helper styles for Priority
  function getPriorityStyle(priority: string | null) {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
      case 'LOW':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500';
    }
  }

  // Helper styles for Sentiment
  function getSentimentStyle(sentiment: string | null) {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'NEGATIVE':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
      case 'NEUTRAL':
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800';
    }
  }

  // Helper styles for Status
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

  // Handle status update
  const handleStatusChange = (status: string) => {
    if (!selectedFeedback) return;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await updateFeedbackStatus(selectedFeedback.id, status);
      if (res?.error) {
        setActionError(res.error);
      } else if (res?.success) {
        setActionSuccess(res.success);
        // Update selected feedback UI state
        setSelectedFeedback({ ...selectedFeedback, status });
      }
    });
  };

  // Sort feedbacks locally
  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        // priority sorting helper
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1, null: 0 } as any;
        const weightA = priorityWeight[a.priority || 'null'];
        const weightB = priorityWeight[b.priority || 'null'];
        return sortOrder === 'desc' ? weightB - weightA : weightA - weightB;
      }
    });
  }, [feedbacks, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'priority') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering Panel */}
      <div className="p-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchParams.get('search') || ''}
              onChange={(e) => updateQueryParam('search', e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Select */}
            <select
              value={searchParams.get('category') || ''}
              onChange={(e) => updateQueryParam('category', e.target.value)}
              className="flex h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Categories</option>
              <option value="BUG">Bug</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="SUGGESTION">Suggestion</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Priority Select */}
            <select
              value={searchParams.get('priority') || ''}
              onChange={(e) => updateQueryParam('priority', e.target.value)}
              className="flex h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Sentiment Select */}
            <select
              value={searchParams.get('sentiment') || ''}
              onChange={(e) => updateQueryParam('sentiment', e.target.value)}
              className="flex h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>

            {/* Status Select */}
            <select
              value={searchParams.get('status') || ''}
              onChange={(e) => updateQueryParam('status', e.target.value)}
              className="flex h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {searchParams.toString() && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="h-9 px-3 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sorting & Result Count Header */}
      <div className="flex items-center justify-between text-sm px-1">
        <span className="text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-semibold text-zinc-900 dark:text-zinc-50">{sortedFeedbacks.length}</span> items
        </span>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => toggleSort('date')}
            className={`flex items-center gap-1 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50 ${
              sortBy === 'date' ? 'text-zinc-900 dark:text-zinc-50 font-bold' : 'text-zinc-500'
            }`}
          >
            Sort by Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('priority')}
            className={`flex items-center gap-1 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50 ${
              sortBy === 'priority' ? 'text-zinc-900 dark:text-zinc-50 font-bold' : 'text-zinc-500'
            }`}
          >
            Sort by Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Feedbacks Grid / Table */}
      {sortedFeedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center min-h-[300px]">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 mb-4 border border-zinc-200 dark:border-zinc-800">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base">No feedback matches your filters</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Try adjusting your query, category, priority, or status configurations.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Submitter</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 w-[35%]">Feedback Details</th>
                  <th className="px-6 py-3.5 text-center">AI Priority</th>
                  <th className="px-6 py-3.5 text-center">AI Sentiment</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-sm">
                {sortedFeedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setActionError(null);
                      setActionSuccess(null);
                    }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors duration-150"
                  >
                    {/* Submitter Name & Email */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {feedback.user.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[150px] truncate">
                        {feedback.user.email}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        {feedback.category ? feedback.category.replace('_', ' ') : 'OTHER'}
                      </span>
                    </td>

                    {/* Feedback Title & Summary */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
                        {feedback.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 italic">
                        {feedback.summary ? `"${feedback.summary}"` : feedback.description}
                      </div>
                    </td>

                    {/* Priority tag */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getPriorityStyle(
                          feedback.priority
                        )}`}
                      >
                        {feedback.priority || 'MEDIUM'}
                      </span>
                    </td>

                    {/* Sentiment tag */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getSentimentStyle(
                          feedback.sentiment
                        )}`}
                      >
                        {feedback.sentiment || 'NEUTRAL'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(
                          feedback.status
                        )}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {feedback.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4 text-right text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  {selectedFeedback.category ? selectedFeedback.category.replace('_', ' ') : 'OTHER'}
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  ID: {selectedFeedback.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-850 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                  {selectedFeedback.title}
                </h3>
              </div>

              {/* Submitter Box */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850/80 grid sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-350 dark:border-zinc-800">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">
                      Submitter
                    </div>
                    <div className="font-bold text-zinc-850 dark:text-zinc-200">
                      {selectedFeedback.user.name || 'Anonymous'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-350 dark:border-zinc-800">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[9px]">
                      Email Address
                    </div>
                    <div className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {selectedFeedback.user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Description
                </h4>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-850/50 rounded-xl text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                  {selectedFeedback.description}
                </div>
              </div>

              {/* AI Insights Block */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                  AI Triaging Insights
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-850/50 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Detected Priority:</span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getPriorityStyle(
                        selectedFeedback.priority
                      )}`}
                    >
                      {selectedFeedback.priority || 'MEDIUM'}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-850/50 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Customer Sentiment:</span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getSentimentStyle(
                        selectedFeedback.sentiment
                      )}`}
                    >
                      {selectedFeedback.sentiment || 'NEUTRAL'}
                    </span>
                  </div>
                </div>

                {selectedFeedback.summary && (
                  <div className="p-4 bg-gradient-to-r from-zinc-50 to-zinc-100/50 dark:from-zinc-950/40 dark:to-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-500 uppercase tracking-wider text-[9px] mr-1.5">
                        AI Summary:
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-250 font-medium italic">
                        "{selectedFeedback.summary}"
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Panel */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-500">
                    Created on{' '}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <Label htmlFor="modal-status" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </Label>
                  <select
                    id="modal-status"
                    value={selectedFeedback.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isPending}
                    className="flex h-9 w-full sm:w-36 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-650 text-zinc-900 dark:text-zinc-200 font-semibold"
                  >
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Success/Error Alerts */}
              {actionError && (
                <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedFeedback(null)}
                className="h-9 px-4 text-xs font-semibold"
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
