import jwt from 'jsonwebtoken';
import { JWT_ACCESS_TOKEN_SECRET } from '../constants/security.constant.js';
import db from '../models/index.cjs';
const { Users } = db;

export const needSignIn = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    // 인증 정보가 아예 없는 경우
    if (!authorizationHeader) {
      return res.status(400).json({
        success: true,
        message: '인증정보가 없습니다.',
      });
    }

    // JWT 기본적인 형태 -> Authorization: Bearer <token>
    const [tokenType, accessToken] = authorizationHeader?.split(' ');
    // 토큰형식이 일치하지 않는 경우
    if (tokenType !== 'Bearer') {
      return res.status(400).json({
        success: true,
        message: '지원하지 않는 인증 방식입니다.',
      });
    }

    // AccessToken이 존재하지 않는 경우
    if (!accessToken) {
      return res.status(400).json({
        success: true,
        message: 'AccessToken이 없습니다.',
      });
    }

    const decodedPayload = jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET);
    const { userId } = decodedPayload;
    console.log({ decodedPayload });

    // 일치하는 userId가 없는 경우
    const user = (await Users.findByPk(userId)).toJSON();

    if (!user) {
      return res.status(400).json({
        success: true,
        message: '존재하지 않는 사용자 입니다.',
      });
    }

    delete user.password;
    res.locals.user = user;

    next();
  } catch (error) {
    console.error(error.message);

    let statusCode = 500;
    let errorMessage = '';

    // switch case 로 분기처리
    switch (error.message) {
      // JWT 유효기간이 지난 경우
      case 'jwt expired':
        statusCode = 401;
        errorMessage = '인증 정보 유효기간이 지났습니다.';
        break;
      // 검증에 실패한 경우
      case 'invalid signature':
        statusCode = 401;
        errorMessage = '유효하지 않는 인증정보입니다.';
        break;
      default:
        statusCode = 500;
        errorMessage =
          '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요';
        break;
    }

    return res.status(statusCode).json({
      success: true,
      message: errorMessage,
    });
  }
};
