import { prisma } from './roadmapService';
import { notFound, conflict } from '../api/middleware/errorHandler';

function parseJsonField(val: string | null | undefined): unknown {
  if (!val) return null;
  try { return JSON.parse(val); } catch { return null; }
}

function toJsonString(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  return JSON.stringify(val);
}

function deserialize(row: {
  id: string;
  provenanceEventId: string;
  summary: string;
  rankedGaps: string | null;
  themes: string | null;
  priorityShifts: string | null;
  groupCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  provenanceEvent?: unknown;
}) {
  return {
    ...row,
    rankedGaps: parseJsonField(row.rankedGaps),
    themes: parseJsonField(row.themes),
    priorityShifts: parseJsonField(row.priorityShifts),
  };
}

export async function getAll() {
  const rows = await prisma.evidenceInput.findMany({
    include: { provenanceEvent: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(deserialize);
}

interface EvidenceInputData {
  provenanceEventId: string;
  summary: string;
  rankedGaps?: unknown;
  themes?: unknown;
  priorityShifts?: unknown;
  groupCount?: number | null;
}

export async function create(data: EvidenceInputData) {
  const existing = await prisma.evidenceInput.findUnique({
    where: { provenanceEventId: data.provenanceEventId },
  });
  if (existing) throw conflict('Evidence already exists for this provenance event');

  const row = await prisma.evidenceInput.create({
    data: {
      provenanceEventId: data.provenanceEventId,
      summary: data.summary,
      rankedGaps: toJsonString(data.rankedGaps),
      themes: toJsonString(data.themes),
      priorityShifts: toJsonString(data.priorityShifts),
      groupCount: data.groupCount ?? null,
    },
    include: { provenanceEvent: true },
  });
  return deserialize(row);
}

export async function update(id: string, data: Partial<EvidenceInputData>) {
  const existing = await prisma.evidenceInput.findUnique({ where: { id } });
  if (!existing) throw notFound('EvidenceInput');

  const row = await prisma.evidenceInput.update({
    where: { id },
    data: {
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.rankedGaps !== undefined && { rankedGaps: toJsonString(data.rankedGaps) }),
      ...(data.themes !== undefined && { themes: toJsonString(data.themes) }),
      ...(data.priorityShifts !== undefined && { priorityShifts: toJsonString(data.priorityShifts) }),
      ...(data.groupCount !== undefined && { groupCount: data.groupCount }),
    },
    include: { provenanceEvent: true },
  });
  return deserialize(row);
}
