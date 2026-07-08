import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';

const rawName = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')).name as string;
const clientName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

function tag(color: (text: string) => string): string {
  return `${color(`{${clientName}}`)} | `;
}

export default class Logger {
  static info(content: string): void {
    console.log(`${tag(chalk.magenta)}${content}`);
  }

  static success(content: string): void {
    console.log(`${tag(chalk.green)}${content}`);
  }

  static error(content: string, error?: unknown): void {
    if (error !== undefined) {
      console.error(`${tag(chalk.red)}${content}`, error);
      return;
    }
    console.error(`${tag(chalk.red)}${content}`);
  }

  static debug(content: string, meta?: Record<string, unknown>): void {
    if (meta && Object.keys(meta).length > 0) {
      console.log(`${tag(chalk.yellow)}${content}`, meta);
      return;
    }
    console.log(`${tag(chalk.yellow)}${content}`);
  }

  static separator(): void {
    console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
  }
}
