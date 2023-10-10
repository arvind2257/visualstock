import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan, { token } from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { styledMethod, styledStatus } from './utils/chalkStyle';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { config } from '@/config.server';
import createMongoConnection from '@utils/mongo';
// Start cron jobs
import { agent } from 'supertest';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = config.nodeEnv;
    this.port = config.port;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.startCronJobs();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    createMongoConnection();
  }

  private initializeMiddlewares() {
    this.morgenSetup();
    // this.app.use(cors({ origin: config.origin, credentials: config.credentials }));
    this.app.use(hpp());
    //    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cookieParser());
    // Custom Response Handlers
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private startCronJobs() {
    //new CronJobsService();
  }

  private morgenSetup() {
    morgan(function (tokens, req, res) {
      return [
        tokens.body(req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
      ].join(' ');
    });
    morgan.token('reqHeaders', req => {
      const prunedHeaders = { ...req.headers };
      delete prunedHeaders.cookie;
      return JSON.stringify(prunedHeaders);
    });
    // morgan.token('resHeaders', (_, res) => JSON.stringify(res.getHeaders()));
    morgan.token('body', (req: any) => {
      const originalBody = { ...req.body };
      delete originalBody.chqbookLoggedinuser;
      delete originalBody.chqbookuserId;
      delete originalBody.chqbookphone;
      delete originalBody.chqbookmembership;
      return JSON.stringify(originalBody);
    });
    morgan.token('httpVersion', req => JSON.stringify(req.httpVersion));
    morgan.token('startTime', (req: any) => JSON.stringify(req._startTime));
    morgan.token('remoteAddress', (req: any) => JSON.stringify(req._remoteAddress));
    morgan.token('cookie', (req: any) => JSON.stringify(req._cookie));

    this.app.use(
      // morgan(
      //   ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" req-headers => :req-headers res-headers => :res-headers req-body => :req[body] :body',
      //   { immediate: true, stream },
      // ),
      morgan(function (tokens, req, res) {
        return (
          [
            tokens.remoteAddress(req, res),
            tokens.startTime(req, res),
            'HTTP/',
            tokens.httpVersion(req, res),
            styledMethod(tokens.method(req, res)),
            tokens.url(req, res),
            styledStatus(tokens.status(req, res)),
            tokens.res(req, res, 'content-length'),
            '-',
            tokens['response-time'](req, res),
            'ms',
          ].join(' ') +
          ' ' +
          JSON.stringify(
            {
              // reqHeaders: tokens.reqHeaders(req, res),
              // cookie: tokens.cookie(req, res),
              body: tokens.body(req, res),
            },
            null,
            '',
          )
        );
      }),
    );
  }
}

export default App;
