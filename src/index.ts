import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from 'express';
import redoc from 'redoc-express';
import { ValidateError } from 'tsoa';

import cors from 'cors';
import { RegisterRoutes } from './routes';
import 'reflect-metadata';
import { Logger } from './lib/logger';
import mongoDb from './lib/mongo';

const run = async () => {
  const app = express();
  const logger = new Logger();
  mongoDb.connect();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors());

  RegisterRoutes(app);

  // health check
  app.get('/', (_req, res) => {
    logger.info('Health check!');
    return res.status(200)
      .send('OK');
  });

  // Error handler
  app.use((
    err: any,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction,
    // eslint-disable-next-line consistent-return
  ): ExResponse | void => {
    if (err instanceof ValidateError) {
      logger.warn(`Caught Validation Error for ${req.path}:`, err.fields);
      return res.status(400)
        .json({
          code: 400,
          errors: err?.fields ? Object.entries(err?.fields)
            .map(([key, value]) => ({ message: `${key}:${value.message}` })) : null,
        });
    }
    const code = err.statusCode || err.status || 500;
    if (err instanceof Error) {
      return res.status(500)
        .json({
          code,
          errors: [{ message: err.message }],
        });
    }

    next();
  });

  // API docs
  app.use('/api-docs', redoc({
    title: 'API Docs',
    specUrl: './openapi.json',
  }));
  app.get('/openapi.json', (req, res) => {
    res.type('json')
      .send(fs.readFileSync(path.resolve(__dirname, 'openapi.json')
        .toString()));
  });

  // finally, listen for something!
  app.listen(process.env.PORT || 80, async () => {
    logger.info(`Via Scientific listening on localhost:${process.env.PORT || 80}`);
  });
};

run();
