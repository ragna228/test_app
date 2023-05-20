import { User } from '../models/user.model';
import { AuthUserDto } from '../models/dto/auth-user.dto';
import jwt from 'jsonwebtoken';
import { Configuration } from '../global/configuration';
import { NetworkError } from '../network.error';
import { hashSync, compareSync } from 'bcrypt';
import { userRepository } from '../global/connection';

export async function create(dto: AuthUserDto): Promise<{ token }> {
  const candidate: User = await userRepository().findOne({
    where: {
      login: dto.login,
    },
  });
  if (candidate) throw new NetworkError(401, {});

  const user: User = await userRepository().create({
    password: hashSync(dto.password, 5),
    login: dto.login,
  });

  return { token: generateToken(user) };
}

export async function authorize(dto: AuthUserDto): Promise<{ token }> {
  const candidate: User = await userRepository().findOne({
    where: {
      login: dto.login,
    },
  });
  if (!candidate) throw new NetworkError(401, {});
  if (!compareSync(dto.password, candidate.password))
    throw new NetworkError(400, {});

  return { token: generateToken(candidate) };
}

function generateToken(user: User) {
  return jwt.sign(
    {
      id: user.id,
      login: user.login,
    },
    Configuration.SECRET || 'BASE_SECRET',
  );
}
