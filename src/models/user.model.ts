import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Post } from './post.model';

@Table({ tableName: 'users', createdAt: true, updatedAt: false })
export class User extends Model<User> {
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  login: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @HasMany(() => Post, 'creatorId')
  posts: Post[];
}
