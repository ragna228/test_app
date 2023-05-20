import { Model, Repository, Sequelize } from 'sequelize-typescript';
import { Configuration } from './configuration';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';

let connection: Sequelize = null;

export async function initDatabase() {
  if (connection != null) throw new Error('База данных уже создана');
  connection = new Sequelize({
    dialect: 'postgres',
    host: Configuration.DATABASE_HOST,
    username: Configuration.USERNAME,
    password: Configuration.PASSWORD,
    port: Number(Configuration.DATABASE_PORT),
    database: Configuration.DATABASE,
    logging: false,
    models: [User, Post],
    repositoryMode: true,
  });
  await connection.sync({ force: false });
}

export const userRepository = (): Repository<User> =>
  connection.getRepository<User>(User);
export const postsRepository = (): Repository<Post> =>
  connection.getRepository<Post>(Post);
