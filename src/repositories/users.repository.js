import { PASSWORD_HASH_SALT_ROUNDS } from '../constants/security.constant.js';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';

export class UsersRepository {
  createOne = async ({ email, name, password }) => {
    const hashedPassword = bcrypt.hashSync(password, PASSWORD_HASH_SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    delete newUser.password;
    return newUser;
  };

  readOneById = async (id) => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  };

  readOneByEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });

    return user;
  };
}
