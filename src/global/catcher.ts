import { RequestHandler } from 'express';
import * as http from 'http';
import { NetworkError } from '../network.error';
import * as QueryString from 'qs';
import { User } from '../models/user.model';
import { userRepository } from './connection';
import { verify } from 'jsonwebtoken';
import { Configuration } from './configuration';
import * as fileUpload from 'express-fileupload';

export class RequestData<T> {
  body: T;
  headers: http.IncomingHttpHeaders;
  query: QueryString.ParsedQs;
  user: User;
  files: fileUpload.FileArray | undefined;
}

export type Callback<T> = (requestData: RequestData<T>) => Promise<object>;

export interface ConfigMethod {
  isRequireAuth?: boolean;
}

async function checkUser(authorization: string, isRequireAuth: boolean) {
  if (!isRequireAuth) {
    return null;
  }
  if (!authorization) {
    throw new NetworkError(401, {});
  }
  const [bearer, token] = authorization.split(' ');
  if (bearer.toLowerCase() !== 'bearer' || !token) {
    throw new NetworkError(401, {});
  }

  try {
    const data = verify(token, Configuration.SECRET) as { id: number };
    return await userRepository().findOne({
      where: {
        id: data.id,
      },
    });
  } catch (e) {
    throw new NetworkError(401, {});
  }
}

export const catcher = <T>(
  callback: Callback<T>,
  configuration: ConfigMethod,
): RequestHandler => {
  return async (req, res) => {
    try {
      const user: User = await checkUser(
        req.headers.authorization,
        configuration.isRequireAuth,
      );
      if (!user && configuration.isRequireAuth) {
        throw new NetworkError(401, {});
      }
      const result = await callback({
        body: req.body as T,
        headers: req.headers,
        query: req.query,
        user: user,
        files: req.files,
      });
      return res.status(200).json(result);
    } catch (e) {
      const code = e instanceof NetworkError ? e.status : 500;
      const message =
        e instanceof NetworkError
          ? e.data
          : { message: 'Internal server error' };

      console.log(e);

      return res.status(code).json(message);
    }
  };
};
