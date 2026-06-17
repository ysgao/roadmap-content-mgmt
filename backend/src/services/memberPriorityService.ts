import { Prisma } from '@prisma/client';
import { prisma } from './roadmapService';
import { notFound } from '../api/middleware/errorHandler';

type WithLinks = { provenanceLinks: Array<{ provenanceEvent: unknown }> };

function flatten<T extends WithLinks>(row: T) {
  const { provenanceLinks, ...rest } = row;
  return { ...rest, provenanceEvents: provenanceLinks.map(l => l.provenanceEvent) };
}

export async function getAll() {
  const rows = await prisma.memberPriority.findMany({
    orderBy: { rank: 'asc' },
    include: {
      provenanceLinks: { include: { provenanceEvent: true } },
    },
  });
  return rows.map(flatten);
}

interface MemberPriorityInput {
  rank: number;
  topicTitle: string;
  responseCount: number;
  responsePercentage: number;
  currentSIActivity?: string | null;
  progressSummary?: string | null;
  nextMilestones?: string | null;
  riskFactors?: string | null;
  provenanceEventIds?: string[];
}

export async function create(data: MemberPriorityInput) {
  return prisma.$transaction(async (tx) => {
    const priority = await tx.memberPriority.create({
      data: {
        rank: data.rank,
        topicTitle: data.topicTitle,
        responseCount: data.responseCount,
        responsePercentage: data.responsePercentage,
        currentSIActivity: data.currentSIActivity ?? null,
        progressSummary: data.progressSummary ?? null,
        nextMilestones: data.nextMilestones ?? null,
        riskFactors: data.riskFactors ?? null,
      },
    });

    if (data.provenanceEventIds?.length) {
      await tx.priorityProvenanceLink.createMany({
        data: data.provenanceEventIds.map((eventId) => ({
          memberPriorityId: priority.id,
          provenanceEventId: eventId,
        })),
      });
    }

    const result = await tx.memberPriority.findUnique({
      where: { id: priority.id },
      include: { provenanceLinks: { include: { provenanceEvent: true } } },
    });
    return result ? flatten(result) : null;
  });
}

export async function update(id: string, data: Partial<MemberPriorityInput>) {
  const existing = await prisma.memberPriority.findUnique({ where: { id } });
  if (!existing) throw notFound('MemberPriority');

  return prisma.$transaction(async (tx) => {
    if (data.provenanceEventIds !== undefined) {
      await tx.priorityProvenanceLink.deleteMany({ where: { memberPriorityId: id } });
    }

    const updateData: Prisma.MemberPriorityUpdateInput = {};
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.topicTitle !== undefined) updateData.topicTitle = data.topicTitle;
    if (data.responseCount !== undefined) updateData.responseCount = data.responseCount;
    if (data.responsePercentage !== undefined) updateData.responsePercentage = data.responsePercentage;
    if (data.currentSIActivity !== undefined) updateData.currentSIActivity = data.currentSIActivity;
    if (data.progressSummary !== undefined) updateData.progressSummary = data.progressSummary;
    if (data.nextMilestones !== undefined) updateData.nextMilestones = data.nextMilestones;
    if (data.riskFactors !== undefined) updateData.riskFactors = data.riskFactors;

    await tx.memberPriority.update({ where: { id }, data: updateData });

    if (data.provenanceEventIds?.length) {
      await tx.priorityProvenanceLink.createMany({
        data: data.provenanceEventIds.map((eventId) => ({
          memberPriorityId: id,
          provenanceEventId: eventId,
        })),
      });
    }

    const result = await tx.memberPriority.findUnique({
      where: { id },
      include: { provenanceLinks: { include: { provenanceEvent: true } } },
    });
    return result ? flatten(result) : null;
  });
}

export async function deleteById(id: string): Promise<void> {
  const existing = await prisma.memberPriority.findUnique({ where: { id } });
  if (!existing) throw notFound('MemberPriority');
  await prisma.memberPriority.delete({ where: { id } });
}
