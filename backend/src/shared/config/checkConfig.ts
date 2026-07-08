import { z } from 'zod';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

const generateEnvSchema = async (): Promise<z.ZodObject<any, any>> => {
  const envPath = path.resolve(process.cwd(), '.env');
  const envConfig = dotenv.parse(await fs.readFile(envPath));
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  const envKeys = Object.keys(envConfig).filter((key) => !key.startsWith('_'));

  for (const key of envKeys) {
    if (key === 'NODE_ENV') {
      schemaShape[key] = z.enum(['development', 'production'], {
        message: "NODE_ENV must be either 'development' or 'production'",
      });
      continue;
    }

    schemaShape[key] = z.string().min(1, `${key} must be at least 1 character long`);
  }

  const optionalFields = [''];
  for (const field of optionalFields) {
    if (field in schemaShape) {
      schemaShape[field] = z.string();
    }
  }

  return z.object(schemaShape);
};

type EnvConfig = z.infer<Awaited<ReturnType<typeof generateEnvSchema>>>;

export const checkConfig = async (): Promise<void> => {
  try {
    const envSchema = await generateEnvSchema();
    let envParse: EnvConfig;

    try {
      envParse = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`Environment validation failed:\n${issues}`);
      }
      throw error;
    }

    const npmScript = process.env.npm_lifecycle_event;

    if (!npmScript) {
      throw new Error('This application must be started using an npm script (npm run dev or npm run start)');
    }

    if (envParse.NODE_ENV === 'production') {
      const distPath = path.resolve(process.cwd(), 'dist');
      let hasCompiledOutput = false;

      try {
        const files = await fs.readdir(distPath);
        hasCompiledOutput = files.length > 0;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      // Docker image copies dist/ contents directly into /app (server.js at root).
      if (!hasCompiledOutput) {
        try {
          await fs.access(path.resolve(process.cwd(), 'server.js'));
          hasCompiledOutput = true;
        } catch {
          // fall through
        }
      }

      if (!hasCompiledOutput) {
        throw new Error("No compiled output found. Please run 'npm run build' first.");
      }

      if (npmScript !== 'start') {
        throw new Error("In production mode, you must use 'npm run start' to run the compiled code.");
      }
    } else if (envParse.NODE_ENV === 'development') {
      if (npmScript !== 'dev') {
        throw new Error("In development mode, you must use 'npm run dev' to run the TypeScript code directly.");
      }
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error(String(error));
  }
};
