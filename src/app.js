import express from 'express';
import { SERVER_PORT } from './constants/app.constant.js';
import { apiRouter } from './routers/index.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

// express를 app으로 변수선언하여 바로 실행
const app = express();
// Express 애플리케이션에서 JSON 형태의 요청(request) body를 파싱(parse)하기 위해 사용되는 미들웨어(middleware)
app.use(express.json());
// 인코딩된 request의 payload를 파싱해주는 미들웨어
app.use(express.urlencoded({ extended: true }));
// localhost:<port number>/api
app.use('/api', apiRouter);
app.use(errorHandler);
// Server 연결
app.listen(SERVER_PORT, () => {
  console.log(`App listening on port ${SERVER_PORT}`);
});
