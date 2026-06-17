import { prisma } from './roadmapService';

const PERIODS = ['H1 2026', 'H2 2026', 'H1 2027', 'H2 2027', 'H1 2028', 'H2 2028', '2029+'];

const HORIZON_ORDER = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance'];

export async function getAll() {
  const items = await prisma.roadmapItem.findMany({
    include: {
      deliveryPeriods: {
        orderBy: { periodYear: 'asc' },
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const sorted = items.sort((a, b) => {
    const ai = HORIZON_ORDER.indexOf(a.horizon);
    const bi = HORIZON_ORDER.indexOf(b.horizon);
    if (ai !== bi) return ai - bi;
    return a.displayOrder - b.displayOrder;
  });

  const timelineItems = sorted.map((item) => ({
    id: item.id,
    title: item.title,
    horizon: item.horizon,
    siStatus: item.siStatus,
    activityType: item.activityType,
    timelineClassification: item.timelineClassification,
    deliveryPeriods: item.deliveryPeriods.map((dp) => ({
      periodLabel: dp.periodLabel,
      periodYear: dp.periodYear,
      periodHalf: dp.periodHalf,
      barStyle: dp.barStyle,
    })),
  }));

  return {
    periods: PERIODS,
    items: timelineItems,
  };
}
