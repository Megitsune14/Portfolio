const PREFIX = '[Analytics]';

export function logAnalytics(message: string, meta?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  if (meta && Object.keys(meta).length > 0) {
    console.log(`${timestamp} ${PREFIX} ${message}`, meta);
  } else {
    console.log(`${timestamp} ${PREFIX} ${message}`);
  }
}
