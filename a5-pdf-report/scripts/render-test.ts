import { getReportData } from "../lib/reports/data.ts";
import { buildReportHtml, renderPdf } from "../lib/reports/render.ts";

const path = "reports/test.pdf";
await renderPdf(buildReportHtml(getReportData()), path);
console.log(`Wrote ${path}`);
