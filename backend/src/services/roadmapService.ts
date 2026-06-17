import { PrismaClient, Horizon, SIStatus, ActivityType, Prisma } from '@prisma/client';
import { badRequest, notFound } from '../api/middleware/errorHandler';

export const prisma = new PrismaClient();

const HORIZON_ORDER: Horizon[] = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance'];

const itemInclude = {
  deliveryPeriods: {
    orderBy: { periodYear: 'asc' as const },
  },
  provenanceLinks: {
    include: {
      provenanceEvent: {
        select: { shortCode: true, displayLabel: true },
      },
    },
  },
} satisfies Prisma.RoadmapItemInclude;

type RawItem = Prisma.RoadmapItemGetPayload<{ include: typeof itemInclude }>;

function formatItem(item: RawItem) {
  return {
    id: item.id,
    title: item.title,
    askDescription: item.askDescription,
    siStatus: item.siStatus,
    impactRating: item.impactRating,
    horizon: item.horizon,
    activityType: item.activityType,
    timelineClassification: item.timelineClassification,
    trigger: item.trigger,
    progressNarrative: item.progressNarrative,
    addressedStatus: item.addressedStatus,
    nextMilestoneDate: item.nextMilestoneDate,
    implementationNotes: item.implementationNotes,
    displayOrder: item.displayOrder,
    provenanceChips: item.provenanceLinks.map((link) => ({
      shortCode: link.provenanceEvent.shortCode,
      displayLabel: link.provenanceEvent.displayLabel,
      referenceNumber: link.referenceNumber,
    })),
    deliveryPeriods: item.deliveryPeriods.map((dp) => ({
      periodLabel: dp.periodLabel,
      periodYear: dp.periodYear,
      periodHalf: dp.periodHalf,
      barStyle: dp.barStyle,
    })),
  };
}

export async function getAll(filters: {
  origin?: string;
  siStatus?: string;
  activityType?: string;
  horizon?: string;
}) {
  const where: Prisma.RoadmapItemWhereInput = {};

  if (filters.siStatus) {
    where.siStatus = filters.siStatus as SIStatus;
  }
  if (filters.activityType) {
    where.activityType = filters.activityType as ActivityType;
  }
  if (filters.horizon) {
    where.horizon = filters.horizon as Horizon;
  }
  if (filters.origin) {
    where.provenanceLinks = {
      some: {
        provenanceEvent: {
          shortCode: filters.origin,
        },
      },
    };
  }

  const items = await prisma.roadmapItem.findMany({
    where,
    include: itemInclude,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const horizons: Record<string, ReturnType<typeof formatItem>[]> = {
    Now: [],
    Next: [],
    Later: [],
    UnderAssessment: [],
    InMaintenance: [],
  };

  for (const item of items) {
    const key = item.horizon as string;
    if (key in horizons) {
      horizons[key].push(formatItem(item));
    }
  }

  const counts: Record<string, number> = {};
  for (const h of HORIZON_ORDER) {
    counts[h] = horizons[h]?.length ?? 0;
  }

  return {
    horizons,
    counts,
    total: items.length,
  };
}

export async function getById(id: string) {
  const item = await prisma.roadmapItem.findUnique({
    where: { id },
    include: itemInclude,
  });

  if (!item) throw notFound('RoadmapItem');

  return formatItem(item);
}

interface ProvenanceLinkInput {
  provenanceEventId: string;
  referenceNumber?: number | null;
}

interface DeliveryPeriodInput {
  periodLabel: string;
  periodYear: number;
  periodHalf: string;
  barStyle: string;
}

interface RoadmapItemInput {
  title: string;
  askDescription: string;
  siStatus: string;
  impactRating?: string | null;
  horizon: string;
  activityType: string;
  timelineClassification: string;
  trigger?: string | null;
  progressNarrative?: string | null;
  addressedStatus?: string | null;
  nextMilestoneDate?: string | null;
  implementationNotes?: string | null;
  displayOrder?: number;
  provenanceLinks?: ProvenanceLinkInput[];
  deliveryPeriods?: DeliveryPeriodInput[];
}

export async function create(data: RoadmapItemInput) {
  if (!data.title) throw badRequest('title is required');
  if (!data.askDescription) throw badRequest('askDescription is required');
  if (!data.siStatus) throw badRequest('siStatus is required');
  if (data.siStatus === 'Active' && !data.impactRating) {
    throw badRequest('impactRating is required when siStatus is Active');
  }

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.roadmapItem.create({
      data: {
        title: data.title,
        askDescription: data.askDescription,
        siStatus: data.siStatus as SIStatus,
        impactRating: data.impactRating ? (data.impactRating as Prisma.EnumImpactRatingFieldUpdateOperationsInput['set']) : undefined,
        horizon: data.horizon as Horizon,
        activityType: data.activityType as ActivityType,
        timelineClassification: data.timelineClassification as Prisma.RoadmapItemCreateInput['timelineClassification'],
        trigger: data.trigger ?? null,
        progressNarrative: data.progressNarrative ?? null,
        addressedStatus: data.addressedStatus ? (data.addressedStatus as Prisma.RoadmapItemCreateInput['addressedStatus']) : undefined,
        nextMilestoneDate: data.nextMilestoneDate ? new Date(data.nextMilestoneDate) : null,
        implementationNotes: data.implementationNotes ?? null,
        displayOrder: data.displayOrder ?? 0,
      },
    });

    if (data.deliveryPeriods?.length) {
      await tx.deliveryPeriod.createMany({
        data: data.deliveryPeriods.map((dp) => ({
          roadmapItemId: created.id,
          periodLabel: dp.periodLabel,
          periodYear: dp.periodYear,
          periodHalf: dp.periodHalf as Prisma.DeliveryPeriodCreateManyInput['periodHalf'],
          barStyle: dp.barStyle as Prisma.DeliveryPeriodCreateManyInput['barStyle'],
        })),
      });
    }

    if (data.provenanceLinks?.length) {
      await tx.itemProvenanceLink.createMany({
        data: data.provenanceLinks.map((pl) => ({
          roadmapItemId: created.id,
          provenanceEventId: pl.provenanceEventId,
          referenceNumber: pl.referenceNumber ?? null,
        })),
      });
    }

    return created;
  });

  return getById(item.id);
}

export async function update(id: string, data: RoadmapItemInput) {
  const existing = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!existing) throw notFound('RoadmapItem');

  if (data.siStatus === 'Active' && !data.impactRating) {
    throw badRequest('impactRating is required when siStatus is Active');
  }

  await prisma.$transaction(async (tx) => {
    await tx.deliveryPeriod.deleteMany({ where: { roadmapItemId: id } });
    await tx.itemProvenanceLink.deleteMany({ where: { roadmapItemId: id } });

    await tx.roadmapItem.update({
      where: { id },
      data: {
        title: data.title,
        askDescription: data.askDescription,
        siStatus: data.siStatus as SIStatus,
        impactRating: data.impactRating ? (data.impactRating as Prisma.EnumImpactRatingFieldUpdateOperationsInput['set']) : null,
        horizon: data.horizon as Horizon,
        activityType: data.activityType as ActivityType,
        timelineClassification: data.timelineClassification as Prisma.RoadmapItemUpdateInput['timelineClassification'],
        trigger: data.trigger ?? null,
        progressNarrative: data.progressNarrative ?? null,
        addressedStatus: data.addressedStatus ? (data.addressedStatus as Prisma.RoadmapItemUpdateInput['addressedStatus']) : null,
        nextMilestoneDate: data.nextMilestoneDate ? new Date(data.nextMilestoneDate) : null,
        implementationNotes: data.implementationNotes ?? null,
        displayOrder: data.displayOrder ?? 0,
      },
    });

    if (data.deliveryPeriods?.length) {
      await tx.deliveryPeriod.createMany({
        data: data.deliveryPeriods.map((dp) => ({
          roadmapItemId: id,
          periodLabel: dp.periodLabel,
          periodYear: dp.periodYear,
          periodHalf: dp.periodHalf as Prisma.DeliveryPeriodCreateManyInput['periodHalf'],
          barStyle: dp.barStyle as Prisma.DeliveryPeriodCreateManyInput['barStyle'],
        })),
      });
    }

    if (data.provenanceLinks?.length) {
      await tx.itemProvenanceLink.createMany({
        data: data.provenanceLinks.map((pl) => ({
          roadmapItemId: id,
          provenanceEventId: pl.provenanceEventId,
          referenceNumber: pl.referenceNumber ?? null,
        })),
      });
    }
  });

  return getById(id);
}

export async function deleteById(id: string): Promise<void> {
  const existing = await prisma.roadmapItem.findUnique({ where: { id } });
  if (!existing) throw notFound('RoadmapItem');
  await prisma.roadmapItem.delete({ where: { id } });
}
