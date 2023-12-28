import * as HttpStatus from '../errors/http-status.errors.js';
import { UsersRepository } from '../repositories/users.repository.js';

export class AuthService {
  constructor() {
    this.usersRepository = new UsersRepository();
  }
  signup = async ({ email, password, name }) => {
    const existedUser = await this.usersRepository.readOneByEmail(email);

    if (existedUser) {
      throw new HttpStatus.BadRequest('이미 가입된 이메일 입니다.');
    }

    const newUser = await this.usersRepository.createOne({
      email,
      password,
      name,
    });

    return newUser;
  };
}
