'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { analyzeFeedback } from '@/services/gemini';
import { revalidatePath } from 'next/cache';
import { FeedbackSubmissionSchema } from '@/types/feedback';

export async function submitFeedback(formData: FormData) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: 'You must be logged in to submit feedback.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const validation = FeedbackSubmissionSchema.safeParse({ title, description });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    // Run AI analysis
    const aiInsights = await analyzeFeedback(description);

    // Create feedback record
    await prisma.feedback.create({
      data: {
        title,
        description,
        category: aiInsights.category,
        priority: aiInsights.priority,
        sentiment: aiInsights.sentiment,
        summary: aiInsights.summary,
        status: 'NEW',
        userId: session.user.id,
      },
    });

    revalidatePath('/dashboard');
    return { success: 'Feedback submitted successfully!' };
  } catch (error) {
    console.error('[Action Error] submitFeedback:', error);
    return { error: 'Failed to submit feedback. Please try again.' };
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status value.' };
  }

  try {
    await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin');
    return { success: `Feedback status updated to ${status}.` };
  } catch (error) {
    console.error('[Action Error] updateFeedbackStatus:', error);
    return { error: 'Failed to update status. Please try again.' };
  }
}
