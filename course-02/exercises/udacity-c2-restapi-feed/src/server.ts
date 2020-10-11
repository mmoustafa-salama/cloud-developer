import express from 'express';
import * as Sentry from "@sentry/node";

import { sequelize } from './sequelize';

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';

import { V0MODELS } from './controllers/v0/model.index';

(async () => {
  await sequelize.addModels(V0MODELS);
  await sequelize.sync();

  const app = express();

  Sentry.init({ dsn: "https://ef5728062dc24c339a061e7dd89b0219@o459890.ingest.sentry.io/5459525" });
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  app.use(bodyParser.json());

  //CORS Should be restricted
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8100");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.use('/api/v0/', IndexRouter)

  // Root URI call
  app.get("/", async (req, res) => {
    res.send("/api/v0/");
  });

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // Start the Server
  const port = process.env.PORT || 8080; // default port to listen
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();