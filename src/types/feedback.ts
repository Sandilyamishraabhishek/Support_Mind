import { z } from 'zod';

export const FeedbackSubmissionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long.')
    .max(100, 'Title cannot exceed 100 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.')
    .max(1000, 'Description cannot exceed 1000 characters.'),
});

export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>;

export const FeedbackStatusUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
});

export type FeedbackStatusUpdate = z.infer<typeof FeedbackStatusUpdateSchema>;
