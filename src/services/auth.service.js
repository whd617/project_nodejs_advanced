import * as HttpStatus from '../errors/http-status.errors.js';
import bcrypt from 'bcrypt';
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
} from '../constants/security.constant.js';
import { UsersRepository } from '../repositories/users.repository.js';
import jwt from 'jsonwebtoken';

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

  signin = async ({ email, password }) => {
    const user = await this.usersRepository.readOneByEmail(email);
    const hashedPassword = user?.password;
    // isPsswordMatched 의 bcrypt.compareSync(password, hashedPassword); 값이 같으면 true를 반환
    // 반대로 반대 값이 나오면 false 즉 같지 않다는 의미
    const isPasswordMatched = bcrypt.compareSync(password, hashedPassword);

    const isCorrectUser = user && isPasswordMatched;

    if (!isCorrectUser) {
      throw new HttpStatus.Unauthorized('일치하는 인증 정보가 없습니다.');
    }
    // accessToken 발급
    // 회원가입시 사용했던 id를 userid이름으로 변경
    // jwt.sign()메서드는 별도의 promise를 반환하지 않고 바로 string을 반환하기 때문에 await을 붙일 필요가 없다.
    const accessToken = jwt.sign(
      { /* payload값 */ userId: user.id },
      /* secret key */ JWT_ACCESS_TOKEN_SECRET,
      { /* options-시간설정 */ expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN },
    );

    return accessToken;
  };
}
