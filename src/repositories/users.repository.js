import { PASSWORD_HASH_SALT_ROUNDS } from '../constants/security.constant.js';
import bcrypt from 'bcrypt';
import db from '../../models/index.cjs';
const { Users } = db;

export class UsersRepository {
  createOne = async ({ email, name, password }) => {
    const hashedPassword = bcrypt.hashSync(password, PASSWORD_HASH_SALT_ROUNDS);

    const newUser = (
      await Users.create({ email, password: hashedPassword, name })
    ).toJSON();
    delete newUser.password;

    return newUser;
  };

  readOneByEmail = async (email) => {
    const user = await Users.findOne({ where: { email } });

    return user?.toJSON();
  };
}
