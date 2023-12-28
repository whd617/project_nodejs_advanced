import { Router } from 'express';
import db from '../../models/index.cjs';
import bcrypt from 'bcrypt';
import { AuthController } from '../controllers/auth.controller.js';
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
} from '../constants/security.constant.js';
import jwt from 'jsonwebtoken';
const { Users } = db;

const authRouter = Router();

const authController = new AuthController();

// 회원가입 /api/auth/siginup
authRouter.post('/signup', authController.signup);

// 로그인
authRouter.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일 입력이 필요합니다.',
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '비밀번호 입력이 필요합니다.',
      });
    }

    const user = (await Users.findOne({ where: { email } }))?.toJSON();
    const hashedPassword = user?.password;
    // isPsswordMatched 의 bcrypt.compareSync(password, hashedPassword); 값이 같으면 true를 반환
    // 반대로 반대 값이 나오면 false 즉 같지 않다는 의미
    const isPasswordMatched = bcrypt.compareSync(password, hashedPassword);

    const isCorrectUser = user && isPasswordMatched;

    if (!isCorrectUser) {
      return res.status(401).json({
        success: false,
        message: '일치하는 인증 정보가 없습니다.',
      });
    }
    // accessToken 발급
    // 회원가입시 사용했던 id를 userid이름으로 변경
    // jwt.sign()메서드는 별도의 promise를 반환하지 않고 바로 string을 반환하기 때문에 await을 붙일 필요가 없다.
    const accessToken = jwt.sign(
      { /* payload값 */ userId: user.id },
      /* secret key */ JWT_ACCESS_TOKEN_SECRET,
      { /* options-시간설정 */ expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN },
    );

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
