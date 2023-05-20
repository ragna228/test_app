import { Express, RequestHandler } from 'express';
import { catcher } from '../global/catcher';
import { NetworkError } from '../network.error';
import {
  addPost,
  editPost,
  getMyPosts,
  getPosts,
  removePost,
} from '../services/posts.service';
import { postsRepository } from '../global/connection';
import { CreatePostDto } from '../models/dto/create-post.dto';
import { EditPostDto } from '../models/dto/edit-post.dto';

const posts: RequestHandler = catcher<void>(async (requestData) => {
  if (!requestData.query.row) {
    throw new NetworkError(400, {
      message: 'Нет поля raw',
    });
  }
  return getPosts(Number(requestData.query.row));
}, {});

const myPosts: RequestHandler = catcher<void>(
  async (requestData) => {
    if (!requestData.query.row) {
      throw new NetworkError(400, {
        message: 'Нет поля raw',
      });
    }
    return getMyPosts(Number(requestData.query.row), requestData.user.id);
  },
  { isRequireAuth: true },
);

const remove: RequestHandler = catcher<void>(
  async (requestData) => {
    if (!requestData.query.id) {
      throw new NetworkError(400, {
        message: 'Нет поля id',
      });
    }
    return removePost(Number(requestData.query.id), requestData.user.id);
  },
  { isRequireAuth: true },
);
const add: RequestHandler = catcher<CreatePostDto>(
  async (requestData) => {
    const files = requestData?.files?.media;
    return await addPost(
      files ? files : [],
      requestData.body.text,
      requestData.user.id,
    );
  },
  {
    isRequireAuth: true,
  },
);

const edit: RequestHandler = catcher<EditPostDto>(
  async (requestData) => {
    const files = requestData?.files?.addMedia;
    return await editPost(
      requestData.body.id,
      requestData.user.id,
      files ? files : [],
      requestData.body.removeMedia,
      requestData.body.text,
    );
  },
  {
    isRequireAuth: true,
  },
);

export const buildPostsController = (app: Express) => {
  app.get('/posts/posts', posts);
  app.get('/posts/myPosts', myPosts);
  app.get('/posts/remove', remove);
  app.post('/posts/add', add);
  app.post('/posts/edit', edit);
};
