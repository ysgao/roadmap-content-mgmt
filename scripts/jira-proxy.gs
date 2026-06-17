// Google Apps Script — Jira Proxy Web App
//
// Deploy as Web App:
//   Execute as: Me
//   Who has access: Anyone
//
// Set Script Properties (Project Settings > Script Properties):
//   JIRA_BASE_URL  = https://ihtsdo.atlassian.net
//   JIRA_EMAIL     = roadmap-service@snomed.org
//   JIRA_API_TOKEN = <your Jira API token>
//
// After deployment, copy the Web App URL into the GitHub repo variable VITE_JIRA_PROXY_URL

function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var keysParam = (e.parameter && e.parameter.keys) ? e.parameter.keys : "";
    if (!keysParam) {
      output.setContent(JSON.stringify({ error: "keys parameter required" }));
      return output;
    }

    var keys = keysParam.split(",").map(function(k) { return k.trim(); }).filter(Boolean);
    if (keys.length > 10) {
      output.setContent(JSON.stringify({ error: "Maximum 10 keys per request" }));
      return output;
    }

    var props = PropertiesService.getScriptProperties();
    var baseUrl = props.getProperty("JIRA_BASE_URL");
    var email = props.getProperty("JIRA_EMAIL");
    var token = props.getProperty("JIRA_API_TOKEN");

    if (!baseUrl || !email || !token) {
      output.setContent(JSON.stringify({ error: "Jira not configured" }));
      return output;
    }

    var auth = Utilities.base64Encode(email + ":" + token);
    var tickets = keys.map(function(key) {
      return fetchTicket(key, baseUrl, auth);
    });

    output.setContent(JSON.stringify({ tickets: tickets }));
  } catch (err) {
    output.setContent(JSON.stringify({ error: "Internal error: " + err.message }));
  }

  return output;
}

function fetchTicket(key, baseUrl, auth) {
  var result = {
    key: key,
    summary: "",
    status: "",
    assignee: null,
    priority: null,
    url: baseUrl + "/browse/" + key
  };

  try {
    var url = baseUrl + "/rest/api/3/issue/" + encodeURIComponent(key) +
              "?fields=summary,status,assignee,priority";

    var response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "Authorization": "Basic " + auth,
        "Accept": "application/json"
      },
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    if (code === 404) { result.error = "Not found"; return result; }
    if (code === 403) { result.error = "Access restricted"; return result; }
    if (code !== 200) { result.error = "HTTP " + code; return result; }

    var data = JSON.parse(response.getContentText());
    result.summary = (data.fields && data.fields.summary) ? data.fields.summary : "";
    result.status = (data.fields && data.fields.status) ? data.fields.status.name : "";
    result.assignee = (data.fields && data.fields.assignee) ? data.fields.assignee.displayName : null;
    result.priority = (data.fields && data.fields.priority) ? data.fields.priority.name : null;

  } catch (err) {
    result.error = "Request failed: " + err.message;
  }

  return result;
}

// Run this function once to verify your Script Properties are set correctly
function testConnection() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("JIRA_BASE_URL: " + props.getProperty("JIRA_BASE_URL"));
  Logger.log("JIRA_EMAIL: " + props.getProperty("JIRA_EMAIL"));
  Logger.log("JIRA_API_TOKEN set: " + (props.getProperty("JIRA_API_TOKEN") ? "yes" : "no"));
}
