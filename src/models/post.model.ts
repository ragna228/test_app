import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'posts', createdAt: true, updatedAt: false })
export class Post extends Model<Post> {
  id: number;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  creatorId: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  text: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  medias: string[];

  @BelongsTo(() => Post, 'creatorId')
  creator: User;
}
