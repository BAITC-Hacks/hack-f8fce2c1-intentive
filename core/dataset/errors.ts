export interface DatasetIssue {
  source: string;
  path: string;
  message: string;
}

export class DatasetValidationError extends Error {
  readonly issues: DatasetIssue[];

  constructor(issues: DatasetIssue[]) {
    super(`Dataset validation failed (${issues.length} issues): ${issues.slice(0, 3).map((issue) => `${issue.source}:${issue.path} ${issue.message}`).join("; ")}`);
    this.name = "DatasetValidationError";
    this.issues = issues;
  }
}
