const ExcelJS = require("exceljs");
const Response = require("../models/ResponseSchema");

exports.exportPhaseResponsesToExcel = async (req, res) => {
  try {
    const { studyId, phaseId } = req.params;

    const responses = await Response.find({
      studyId,
      phaseId,
      status: "SUBMITTED",
    }).sort({ submittedAt: 1 });

    if (!responses.length) {
      return res.status(404).json({ message: "No submitted responses found" });
    }

    // build question list from first response snapshot
    const questions = responses[0]?.snapshot?.questions ?? [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Responses");

    // header row
    sheet.columns = [
      { header: "Participant ID", key: "participantId", width: 38 },
      { header: "Submitted At",   key: "submittedAt",   width: 22 },
      ...questions.map((q) => ({
        header: q.text || q.questionId,
        key: q.questionId,
        width: 30,
      })),
    ];

    // style header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // data rows
    responses.forEach((resp) => {
      const row = {
        participantId: resp.participantId,
        submittedAt: resp.submittedAt
          ? new Date(resp.submittedAt).toLocaleString()
          : "",
      };
      resp.answers.forEach((ans) => {
        row[ans.questionId] = Array.isArray(ans.value)
          ? ans.value.join(", ")
          : String(ans.value ?? "");
      });
      sheet.addRow(row);
    });

    // alternating row colors
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF0F4FF" : "FFFFFFFF" },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="responses_${phaseId}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return res.status(500).json({ message: "Export failed", error: err.message });
  }
};