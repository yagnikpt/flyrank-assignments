import { getReportData } from "../lib/reports/data.ts";

const { orders, ...summary } = getReportData();
console.log(JSON.stringify({ ...summary, orderRows: orders.length }, null, 2));
