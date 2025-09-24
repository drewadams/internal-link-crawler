export interface CheckerOptions {
  timeout?: number;
  maxDepth?: number;
  batchSize?: number; // Add a batchSize option
  basicAuth?: {
    username: string;
    password: string;
  };
}
