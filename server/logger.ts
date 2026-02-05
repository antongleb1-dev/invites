import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'freedompay-debug.log');

export function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  console.log(message, data || '');
}

