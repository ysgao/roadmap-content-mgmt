import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.evidenceInput.deleteMany();
  await prisma.itemProvenanceLink.deleteMany();
  await prisma.priorityProvenanceLink.deleteMany();
  await prisma.deliveryPeriod.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.memberPriority.deleteMany();
  await prisma.provenanceEvent.deleteMany();

  const seoul24 = await prisma.provenanceEvent.create({
    data: {
      shortCode: 'Seoul24',
      displayLabel: "Seoul '24",
      eventType: 'Survey',
      eventDate: new Date('2024-10-01'),
      participantCount: 23,
    },
  });

  const antwerp25 = await prisma.provenanceEvent.create({
    data: {
      shortCode: 'Antwerp25',
      displayLabel: "Antwerp '25",
      eventType: 'Workshop',
      eventDate: new Date('2025-04-01'),
      participantCount: 16,
    },
  });

  const vienna26 = await prisma.provenanceEvent.create({
    data: {
      shortCode: 'Vienna26',
      displayLabel: "Vienna '26",
      eventType: 'Forum',
      eventDate: new Date('2026-04-01'),
      participantCount: 9,
    },
  });

  const lab = await prisma.memberPriority.create({
    data: {
      rank: 1,
      topicTitle: 'Laboratory',
      responseCount: 14,
      responsePercentage: 60.87,
      currentSIActivity: 'Active development of laboratory medicine content',
      progressSummary: 'Significant progress made in Q1 2026',
      nextMilestones: 'Complete hierarchy restructure by H2 2026',
      riskFactors: 'Dependency on external SME availability',
    },
  });

  const substances = await prisma.memberPriority.create({
    data: {
      rank: 2,
      topicTitle: 'Substances',
      responseCount: 12,
      responsePercentage: 52.17,
      currentSIActivity: 'Substances and medications hierarchy review',
      progressSummary: 'Phase 1 complete, phase 2 in progress',
      nextMilestones: 'International substance alignment by H1 2027',
      riskFactors: 'Complex cross-hierarchy dependencies',
    },
  });

  const clinicalFindings = await prisma.memberPriority.create({
    data: {
      rank: 3,
      topicTitle: 'Clinical findings',
      responseCount: 10,
      responsePercentage: 43.48,
      currentSIActivity: 'Quality improvement programme for clinical findings',
      progressSummary: 'Gap analysis complete',
      nextMilestones: 'Begin remediation in H2 2026',
      riskFactors: 'Large scope, prioritisation needed',
    },
  });

  const procedures = await prisma.memberPriority.create({
    data: {
      rank: 4,
      topicTitle: 'Procedures',
      responseCount: 9,
      responsePercentage: 39.13,
      currentSIActivity: 'Procedure hierarchy assessment',
      progressSummary: 'Assessment phase ongoing',
      nextMilestones: 'Assessment complete by end of 2026',
      riskFactors: 'Resource constraints',
    },
  });

  const pharmacy = await prisma.memberPriority.create({
    data: {
      rank: 5,
      topicTitle: 'Pharmacy',
      responseCount: 8,
      responsePercentage: 34.78,
      currentSIActivity: 'Pharmacy collaboration planning',
      progressSummary: 'Partner organisations identified',
      nextMilestones: 'Formal collaboration agreement H1 2027',
      riskFactors: 'Multi-stakeholder coordination complexity',
    },
  });

  await prisma.priorityProvenanceLink.createMany({
    data: [
      { memberPriorityId: lab.id, provenanceEventId: seoul24.id },
      { memberPriorityId: substances.id, provenanceEventId: seoul24.id },
      { memberPriorityId: clinicalFindings.id, provenanceEventId: seoul24.id },
      { memberPriorityId: procedures.id, provenanceEventId: seoul24.id },
      { memberPriorityId: pharmacy.id, provenanceEventId: seoul24.id },
    ],
  });

  const labItem = await prisma.roadmapItem.create({
    data: {
      title: 'Laboratory Medicine Content Development',
      askDescription:
        'Develop and enhance SNOMED CT content for laboratory medicine including result interpretation, specimen types, and laboratory procedures to support clinical laboratory information systems.',
      siStatus: 'Active',
      impactRating: 'High',
      horizon: 'Now',
      activityType: 'MemberDriven',
      timelineClassification: 'Project',
      trigger: 'Member survey priority #1',
      progressNarrative:
        'Active development underway. Hierarchy restructure complete for core laboratory concepts. Working with laboratory medicine SMEs to refine result interpretation content.',
      addressedStatus: 'Partially',
      nextMilestoneDate: new Date('2026-09-01'),
      displayOrder: 1,
    },
  });

  await prisma.deliveryPeriod.createMany({
    data: [
      {
        roadmapItemId: labItem.id,
        periodLabel: 'H1 2026',
        periodYear: 2026,
        periodHalf: 'H1',
        barStyle: 'Active',
      },
      {
        roadmapItemId: labItem.id,
        periodLabel: 'H2 2026',
        periodYear: 2026,
        periodHalf: 'H2',
        barStyle: 'Active',
      },
    ],
  });

  await prisma.itemProvenanceLink.createMany({
    data: [
      { roadmapItemId: labItem.id, provenanceEventId: seoul24.id, referenceNumber: 1 },
      { roadmapItemId: labItem.id, provenanceEventId: antwerp25.id, referenceNumber: null },
    ],
  });

  const substancesItem = await prisma.roadmapItem.create({
    data: {
      title: 'Substances and Medications Hierarchy',
      askDescription:
        'Restructure the substances and medications hierarchy to improve clinical usability, align with international standards, and support medication management use cases.',
      siStatus: 'Active',
      impactRating: 'High',
      horizon: 'Now',
      activityType: 'MemberDriven',
      timelineClassification: 'Project',
      trigger: 'Member survey priority #2',
      progressNarrative:
        'Phase 1 hierarchy review complete. International alignment work commenced with key member national release centres.',
      addressedStatus: 'Partially',
      nextMilestoneDate: new Date('2026-12-01'),
      displayOrder: 2,
    },
  });

  await prisma.deliveryPeriod.createMany({
    data: [
      {
        roadmapItemId: substancesItem.id,
        periodLabel: 'H1 2026',
        periodYear: 2026,
        periodHalf: 'H1',
        barStyle: 'Active',
      },
      {
        roadmapItemId: substancesItem.id,
        periodLabel: 'H2 2026',
        periodYear: 2026,
        periodHalf: 'H2',
        barStyle: 'Planned',
      },
    ],
  });

  await prisma.itemProvenanceLink.create({
    data: {
      roadmapItemId: substancesItem.id,
      provenanceEventId: seoul24.id,
      referenceNumber: 2,
    },
  });

  const clinicalItem = await prisma.roadmapItem.create({
    data: {
      title: 'Clinical Findings Quality Improvement',
      askDescription:
        'Systematic quality improvement of the clinical findings hierarchy to address gaps, inconsistencies, and usability issues identified through member feedback and QA analysis.',
      siStatus: 'Planned',
      impactRating: 'Medium',
      horizon: 'Next',
      activityType: 'QAProgramme',
      timelineClassification: 'Project',
      trigger: 'Member survey priority #3 + QA programme findings',
      progressNarrative: 'Gap analysis and prioritisation complete. Ready to begin remediation in H2 2026.',
      addressedStatus: null,
      displayOrder: 1,
    },
  });

  await prisma.deliveryPeriod.create({
    data: {
      roadmapItemId: clinicalItem.id,
      periodLabel: 'H2 2026',
      periodYear: 2026,
      periodHalf: 'H2',
      barStyle: 'Planned',
    },
  });

  await prisma.itemProvenanceLink.createMany({
    data: [
      { roadmapItemId: clinicalItem.id, provenanceEventId: seoul24.id, referenceNumber: 3 },
      { roadmapItemId: clinicalItem.id, provenanceEventId: vienna26.id, referenceNumber: null },
    ],
  });

  const pharmacyItem = await prisma.roadmapItem.create({
    data: {
      title: 'Pharmacy and Medication Management',
      askDescription:
        'Collaborative development of pharmacy and medication management content with key partner organisations to support pharmacy workflows, prescribing, and dispensing use cases.',
      siStatus: 'Planned',
      impactRating: 'Low',
      horizon: 'Later',
      activityType: 'Collaboration',
      timelineClassification: 'Project',
      trigger: 'Member survey priority #5',
      progressNarrative: 'Partner organisations identified. Collaboration framework being established.',
      displayOrder: 1,
    },
  });

  await prisma.deliveryPeriod.create({
    data: {
      roadmapItemId: pharmacyItem.id,
      periodLabel: 'H1 2027',
      periodYear: 2027,
      periodHalf: 'H1',
      barStyle: 'Planned',
    },
  });

  await prisma.itemProvenanceLink.create({
    data: {
      roadmapItemId: pharmacyItem.id,
      provenanceEventId: seoul24.id,
      referenceNumber: 5,
    },
  });

  const maintenanceItem = await prisma.roadmapItem.create({
    data: {
      title: 'Terminology Maintenance',
      askDescription:
        'Ongoing maintenance of existing SNOMED CT content including error corrections, requested additions, and keeping content current with evolving clinical knowledge.',
      siStatus: 'Active',
      impactRating: null,
      horizon: 'InMaintenance',
      activityType: 'Maintenance',
      timelineClassification: 'Continuous',
      progressNarrative: 'Continuous maintenance programme running with regular release cycles.',
      addressedStatus: 'Yes',
      displayOrder: 1,
    },
  });

  console.log(`Created maintenance item: ${maintenanceItem.id}`);

  await prisma.evidenceInput.create({
    data: {
      provenanceEventId: seoul24.id,
      summary:
        'Seoul 2024 member survey collected input from 23 member organisations on content priorities for 2025-2027. Laboratory medicine emerged as the top priority with 60.87% of respondents identifying it as critical. Substances/medications and clinical findings quality were the next most cited priorities.',
      rankedGaps: JSON.stringify([
        { rank: 1, topic: 'Laboratory Medicine', votes: 14, percentage: 60.87 },
        { rank: 2, topic: 'Substances and Medications', votes: 12, percentage: 52.17 },
        { rank: 3, topic: 'Clinical Findings Quality', votes: 10, percentage: 43.48 },
        { rank: 4, topic: 'Procedures', votes: 9, percentage: 39.13 },
        { rank: 5, topic: 'Pharmacy', votes: 8, percentage: 34.78 },
      ]),
      themes: JSON.stringify([
        {
          theme: 'Clinical usability',
          description: 'Members consistently cited need for more clinically-oriented content',
        },
        {
          theme: 'Implementation support',
          description: 'Demand for better implementation guidance alongside content changes',
        },
        {
          theme: 'International alignment',
          description: 'Strong desire for alignment across national release centres',
        },
      ]),
      priorityShifts: JSON.stringify([
        {
          topic: 'Laboratory Medicine',
          previousRank: 3,
          currentRank: 1,
          note: 'Significant increase driven by IVD regulation requirements',
        },
        {
          topic: 'Pharmacy',
          previousRank: 2,
          currentRank: 5,
          note: 'Decreased due to perception of progress made',
        },
      ]),
      groupCount: 23,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
