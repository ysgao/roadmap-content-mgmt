function setupRoadmapSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var pe = ss.getSheetByName("ProvenanceEvents") || ss.insertSheet("ProvenanceEvents");
  pe.clearContents();
  pe.appendRow(["id","shortCode","displayLabel","eventType","eventDate","participantCount"]);
  pe.appendRow(["1","Seoul24","Seoul 24","Survey","2024-10-01","23"]);
  pe.appendRow(["2","Antwerp25","Antwerp 25","Workshop","2025-04-01","16"]);
  pe.appendRow(["3","Vienna26","Vienna 26","Forum","2026-04-01","9"]);
  pe.getRange(1,1,1,6).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff");

  var ri = ss.getSheetByName("RoadmapItems") || ss.insertSheet("RoadmapItems");
  ri.clearContents();
  ri.appendRow(["id","title","askDescription","siStatus","impactRating","horizon","activityType","timelineClassification","trigger","progressNarrative","addressedStatus","nextMilestoneDate","implementationNotes","displayOrder","provenanceChips","deliveryPeriods"]);
  ri.appendRow(["1","Laboratory Medicine Content Development","Develop and enhance SNOMED CT content for laboratory medicine including result interpretation, specimen types, and laboratory procedures.","Active","High","Now","MemberDriven","Project","Member survey priority 1","Active development underway. Hierarchy restructure complete for core laboratory concepts.","Partially","2026-09-01","","1","Seoul24:1|Antwerp25","H1 2026:Active|H2 2026:Active"]);
  ri.appendRow(["2","Substances and Medications Hierarchy","Restructure the substances and medications hierarchy to improve clinical usability and align with international standards.","Active","High","Now","MemberDriven","Project","Member survey priority 2","Phase 1 hierarchy review complete. International alignment work commenced.","Partially","2026-12-01","","2","Seoul24:2","H1 2026:Active|H2 2026:Planned"]);
  ri.appendRow(["3","Clinical Findings Quality Improvement","Systematic quality improvement of the clinical findings hierarchy to address gaps and inconsistencies.","Planned","Medium","Next","QAProgramme","Project","Member survey priority 3 plus QA programme findings","Gap analysis and prioritisation complete. Ready to begin remediation in H2 2026.","","","","1","Seoul24:3|Vienna26","H2 2026:Planned"]);
  ri.appendRow(["4","Pharmacy and Medication Management","Collaborative development of pharmacy and medication management content with partner organisations.","Planned","Low","Later","Collaboration","Project","Member survey priority 5","Partner organisations identified. Collaboration framework being established.","","","","1","Seoul24:5","H1 2027:Planned"]);
  ri.appendRow(["5","Terminology Maintenance","Ongoing maintenance of existing SNOMED CT content including error corrections and requested additions.","Active","","InMaintenance","Maintenance","Continuous","","Continuous maintenance programme running with regular release cycles.","Yes","","","1","",""]);
  ri.getRange(1,1,1,16).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff");
  ri.setFrozenRows(1);

  var mp = ss.getSheetByName("MemberPriorities") || ss.insertSheet("MemberPriorities");
  mp.clearContents();
  mp.appendRow(["id","rank","topicTitle","responseCount","responsePercentage","currentSIActivity","progressSummary","nextMilestones","riskFactors","provenanceEvents"]);
  mp.appendRow(["1","1","Laboratory","14","60.87","Active development of laboratory medicine content","Significant progress made in Q1 2026","Complete hierarchy restructure by H2 2026","Dependency on external SME availability","Seoul24"]);
  mp.appendRow(["2","2","Substances","12","52.17","Substances and medications hierarchy review","Phase 1 complete, phase 2 in progress","International substance alignment by H1 2027","Complex cross-hierarchy dependencies","Seoul24"]);
  mp.appendRow(["3","3","Clinical findings","10","43.48","Quality improvement programme for clinical findings","Gap analysis complete","Begin remediation in H2 2026","Large scope, prioritisation needed","Seoul24"]);
  mp.appendRow(["4","4","Procedures","9","39.13","Procedure hierarchy assessment","Assessment phase ongoing","Assessment complete by end of 2026","Resource constraints","Seoul24"]);
  mp.appendRow(["5","5","Pharmacy","8","34.78","Pharmacy collaboration planning","Partner organisations identified","Formal collaboration agreement H1 2027","Multi-stakeholder coordination complexity","Seoul24"]);
  mp.getRange(1,1,1,10).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff");
  mp.setFrozenRows(1);

  var sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1) ss.deleteSheet(sheet1);

  SpreadsheetApp.getUi().alert("Done. 3 tabs ready.");
}

function addJiraTicketsColumn() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ri = ss.getSheetByName("RoadmapItems");
  if (!ri) { SpreadsheetApp.getUi().alert("RoadmapItems tab not found"); return; }
  ri.getRange(1, 17).setValue("jiraTickets");
  ri.getRange(1, 17).setFontWeight("bold").setBackground("#1a3a5c").setFontColor("#ffffff");
  SpreadsheetApp.getUi().alert("jiraTickets column added at column 17");
}
