import * as express from 'express';
import 'reflect-metadata';
import {
  createExpressServer,
  getMetadataArgsStorage,
} from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';
import { createConnection } from 'typeorm';

createConnection().then(() => {
  // eslint-disable-next-line no-console
  console.log('Database Connection Established.');
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.log('Database Connection Failed.', err);
});

const app = createExpressServer({
  routePrefix: '/api/v1',
  controllers: [`${__dirname}/controllers/*.ts`],
  middlewares: [`${__dirname}/middlewares/**/*.ts`],
  interceptors: [`${__dirname}/interceptors/**/*.ts`],
  cors: '*'
});

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));

const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(storage);
spec.info = {
  title: 'Admin',
  description: 'admin',
  version: 'V1',
};

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(spec));

app.get('/redirect', (req: any, res: any) => {
  if (req.query.url) {
    res.redirect(req.query.url);
  }
  res.send('Invalid request');
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

const port = 9500;
app.listen(port, () => console.log(`App started on port ${port}!`));
