import { EventType, Prisma } from '@prisma/client';
import { prisma } from './roadmapService';
import { notFound } from '../api/middleware/errorHandler';

export async function getAll() {
  return prisma.provenanceEvent.findMany({
    orderBy: { eventDate: 'desc' },
  });
}

interface ProvenanceEventInput {
  shortCode: string;
  displayLabel: string;
  eventType: string;
  eventDate: string;
  participantCount?: number | null;
}

export async function create(data: ProvenanceEventInput) {
  return prisma.provenanceEvent.create({
    data: {
      shortCode: data.shortCode,
      displayLabel: data.displayLabel,
      eventType: data.eventType as EventType,
      eventDate: new Date(data.eventDate),
      participantCount: data.participantCount ?? null,
    },
  });
}

export async function update(id: string, data: Partial<ProvenanceEventInput>) {
  const existing = await prisma.provenanceEvent.findUnique({ where: { id } });
  if (!existing) throw notFound('ProvenanceEvent');

  const updateData: Prisma.ProvenanceEventUpdateInput = {};
  if (data.shortCode !== undefined) updateData.shortCode = data.shortCode;
  if (data.displayLabel !== undefined) updateData.displayLabel = data.displayLabel;
  if (data.eventType !== undefined) updateData.eventType = data.eventType as EventType;
  if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
  if (data.participantCount !== undefined) updateData.participantCount = data.participantCount;

  return prisma.provenanceEvent.update({
    where: { id },
    data: updateData,
  });
}
