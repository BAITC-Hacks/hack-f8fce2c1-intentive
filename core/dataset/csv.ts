import { DatasetValidationError } from "./errors";

export const activityColumns = [
  "record_id", "employee_id", "event_id", "date", "due_date", "status",
  "completion_pct", "score", "feedback_rating", "assigned_by",
] as const;

/** Strict CSV reader: quoted fields, escaped quotes, CRLF, BOM and reordered headers. */
export function parseActivityCsv(input: string): Record<string, unknown>[] {
  const source = "activity_history.csv";
  const fail = (path: string, message: string): never => { throw new DatasetValidationError([{ source, path, message }]); };
  const csv = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  const endField = () => { row.push(field); field = ""; closed = false; };
  const endRow = () => { endField(); rows.push(row); row = []; };
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (quoted) {
      if (char === '"') {
        if (csv[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === ",") endField();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && csv[i + 1] === "\n") i++;
      endRow();
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (closed || char === '"') fail(`row[${rows.length + 1}]`, "Malformed quoted field");
    else field += char;
  }
  if (quoted) fail(`row[${rows.length + 1}]`, "Unterminated quoted field");
  if (field || row.length || closed) endRow();
  const headers = rows.shift()?.map((value) => value.trim());
  if (!headers || headers.length !== activityColumns.length || new Set(headers).size !== headers.length
    || activityColumns.some((column) => !headers.includes(column))) {
    fail("header", `Expected exactly these columns: ${activityColumns.join(",")}`);
  }
  return rows.map((values, index) => {
    if (values.length !== headers!.length) fail(`row[${index + 2}]`, "Column count does not match header");
    const record: Record<string, unknown> = Object.fromEntries(headers!.map((header, i) => [header, values[i].trim()]));
    for (const key of ["completion_pct", "score", "feedback_rating"]) {
      const value = record[key] as string;
      record[key] = value === "" && key !== "completion_pct" ? null : /^\d+$/.test(value) ? Number(value) : value;
    }
    if (record.due_date === "") record.due_date = null;
    return record;
  });
}
