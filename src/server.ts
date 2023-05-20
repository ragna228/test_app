import express, { Express } from 'express';
import { Configuration } from './global/configuration';
import { initDatabase } from './global/connection';
import { buildUsersController } from './controller/users.controller';
import { buildPostsController } from './controller/posts.controller';
import fileUpload from 'express-fileupload';
import * as bodyParser from 'body-parser';
import { setup, serve } from 'swagger-ui-express';
import * as fs from 'fs';
const runApp = async () => {
  const app: Express = express();
  const port: number = Number(Configuration.APP_PORT) || 9999;

  try {
    await initDatabase();

    app.use(
      fileUpload({
        createParentPath: true,
      }),
    );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/medias', express.static('medias'));
    const data = fs.readFileSync(__dirname + '/openapi.json');
    app.use('/api/docs', serve, setup(JSON.parse(data.toString())));

    buildUsersController(app);
    buildPostsController(app);

    app.listen(port, () => {
      console.log(`Сервер запустился на порте ${port}`);
    });
  } catch (e) {
    console.log(e);
  }
};

runApp();
