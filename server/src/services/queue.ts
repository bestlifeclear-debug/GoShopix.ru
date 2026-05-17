import { JobStatus, JobType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  options?: { runAt?: Date; createdById?: string },
) {
  return prisma.backgroundJob.create({
    data: {
      type,
      payload: payload as Prisma.InputJsonValue,
      runAt: options?.runAt ?? new Date(),
      createdById: options?.createdById,
    },
  });
}

export async function claimNextJob() {
  const now = new Date();
  const candidates = await prisma.backgroundJob.findMany({
    where: {
      status: JobStatus.pending,
      runAt: { lte: now },
    },
    orderBy: { runAt: 'asc' },
    take: 5,
  });

  const next = candidates.find((j) => j.attempts < j.maxAttempts);
  if (!next) return null;

  return prisma.backgroundJob.update({
    where: { id: next.id },
    data: { status: JobStatus.processing, attempts: { increment: 1 } },
  });
}

export async function completeJob(id: string) {
  await prisma.backgroundJob.update({
    where: { id },
    data: { status: JobStatus.completed },
  });
}

export async function failJob(id: string, error: string, retryDelayMs = 60_000) {
  const job = await prisma.backgroundJob.findUnique({ where: { id } });
  if (!job) return;

  const shouldRetry = job.attempts < job.maxAttempts;
  await prisma.backgroundJob.update({
    where: { id },
    data: {
      status: shouldRetry ? JobStatus.pending : JobStatus.failed,
      lastError: error.slice(0, 2000),
      runAt: shouldRetry ? new Date(Date.now() + retryDelayMs) : job.runAt,
    },
  });
}
