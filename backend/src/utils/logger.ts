type LogMeta = Record<string, unknown>;

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, meta?: LogMeta) =>
    console.log(JSON.stringify({ level: 'info', message, timestamp: timestamp(), ...meta })),
  warn: (message: string, meta?: LogMeta) =>
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: timestamp(), ...meta })),
  error: (message: string, meta?: LogMeta) =>
    console.error(JSON.stringify({ level: 'error', message, timestamp: timestamp(), ...meta })),
};