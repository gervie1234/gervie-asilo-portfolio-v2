const CONFIG = Object.freeze({
  recipient: "gervieasilo@gmail.com",
  sheetName: "Inquiries",
  maxMessageLength: 2000,
});

const HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Company",
  "Project Type",
  "Budget",
  "Message",
  "Source Page",
  "Status",
  "Reply Notes",
];

function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Open this script from a Google Sheet before running setup().");

  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());
  const sheet = getOrCreateInquirySheet_(spreadsheet);
  formatInquirySheet_(sheet);
  SpreadsheetApp.flush();
}

function doGet() {
  return json_({ ok: true, service: "Gervie Asilo portfolio contact form" });
}

function doPost(event) {
  try {
    const data = JSON.parse((event && event.postData && event.postData.contents) || "{}");

    if (cleanText_(data.website, 200)) return json_({ ok: true });

    const inquiry = {
      name: cleanCell_(data.name, 100),
      email: cleanCell_(data.email, 160).toLowerCase(),
      company: cleanCell_(data.company, 120),
      projectType: cleanCell_(data.projectType, 120),
      budget: cleanCell_(data.budget, 80),
      message: cleanCell_(data.message, CONFIG.maxMessageLength),
      source: cleanCell_(data.source, 500),
    };

    validateInquiry_(inquiry);

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) throw new Error("Run setup() once before accepting submissions.");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheet = getOrCreateInquirySheet_(spreadsheet);
      sheet.appendRow([
        new Date(),
        inquiry.name,
        inquiry.email,
        inquiry.company,
        inquiry.projectType,
        inquiry.budget,
        inquiry.message,
        inquiry.source,
        "New",
        "",
      ]);
      sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: CONFIG.recipient,
      replyTo: inquiry.email,
      name: "Gervie Asilo Portfolio",
      subject: "[Portfolio inquiry] " + inquiry.name + " — " + inquiry.projectType,
      htmlBody: buildEmailBody_(inquiry),
      body: buildPlainTextEmail_(inquiry),
    });

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function getOrCreateInquirySheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return sheet;
}

function formatInquirySheet_(sheet) {
  const header = sheet.getRange(1, 1, 1, HEADERS.length);
  header
    .setValues([HEADERS])
    .setFontWeight("bold")
    .setBackground("#eeeeee")
    .setFontColor("#111111")
    .setHorizontalAlignment("left");

  sheet.setFrozenRows(1);
  [150, 150, 210, 170, 210, 150, 420, 260, 100, 280].forEach(function(width, index) {
    sheet.setColumnWidth(index + 1, width);
  });
  sheet.getRange("G:G").setWrap(true).setVerticalAlignment("top");
  sheet.getRange("J:J").setWrap(true).setVerticalAlignment("top");
}

function validateInquiry_(inquiry) {
  if (!inquiry.name) throw new Error("Name is required.");
  if (!inquiry.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) throw new Error("A valid email is required.");
  if (!inquiry.projectType) throw new Error("Project type is required.");
  if (!inquiry.message || inquiry.message.length < 20) throw new Error("Project brief must be at least 20 characters.");
}

function cleanText_(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanCell_(value, maxLength) {
  const text = cleanText_(value, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailBody_(inquiry) {
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Company", inquiry.company || "—"],
    ["Project type", inquiry.projectType],
    ["Budget", inquiry.budget || "Not specified"],
    ["Source", inquiry.source || "Portfolio contact form"],
  ];

  const details = rows.map(function(row) {
    return "<tr><td style='padding:6px 14px 6px 0;color:#666'>" + escapeHtml_(row[0]) + "</td><td style='padding:6px 0'><strong>" + escapeHtml_(row[1]) + "</strong></td></tr>";
  }).join("");

  return "<div style='font-family:Arial,sans-serif;color:#111;line-height:1.6;max-width:680px'>" +
    "<h2 style='margin:0 0 18px'>New portfolio inquiry</h2>" +
    "<table style='border-collapse:collapse'>" + details + "</table>" +
    "<h3 style='margin:24px 0 8px'>Project brief</h3>" +
    "<div style='padding:16px;background:#f5f5f5;border-left:3px solid #9acd32'>" + escapeHtml_(inquiry.message).replace(/\n/g, "<br>") + "</div>" +
    "<p style='margin-top:22px;color:#666'>Reply directly to this email to contact " + escapeHtml_(inquiry.name) + ".</p>" +
    "</div>";
}

function buildPlainTextEmail_(inquiry) {
  return [
    "New portfolio inquiry",
    "",
    "Name: " + inquiry.name,
    "Email: " + inquiry.email,
    "Company: " + (inquiry.company || "—"),
    "Project type: " + inquiry.projectType,
    "Budget: " + (inquiry.budget || "Not specified"),
    "Source: " + (inquiry.source || "Portfolio contact form"),
    "",
    "Project brief:",
    inquiry.message,
  ].join("\n");
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
