import { Express, RequestHandler } from 'express';
import { AuthUserDto } from '../models/dto/auth-user.dto';
import { catcher } from '../global/catcher';
import { authorize, create } from '../services/users.service';

const login: RequestHandler = catcher<AuthUserDto>(
  async (requestData) => {
    return authorize(requestData.body);
  },
  { isRequireAuth: false },
);

const registration: RequestHandler = catcher<AuthUserDto>(
  async (requestData) => {
    return create(requestData.body);
  },
  { isRequireAuth: false },
);

export const buildUsersController = (app: Express) => {
  app.post('/users/login', login);
  app.post('/users/registration', registration);
};
