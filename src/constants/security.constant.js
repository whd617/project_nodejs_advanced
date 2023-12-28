import 'dotenv/config';

// 환경변수의 값을 불러올 때에는 기본적으로 String으로 불러오게 된다
// 따라서 강제적으로 항변환을 해줘야한다.
export const PASSWORD_HASH_SALT_ROUNDS = Number.parseInt(
  process.env.PASSWORD_HASH_SALT_ROUNDS,
  10,
);

export const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
export const JWT_ACCESS_TOKEN_EXPIRES_IN = '12h';
