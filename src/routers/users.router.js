import { Router } from 'express';
import { needSignIn } from '../middlewares/need-signin.middleware.js';
import { UsersController } from '../controllers/user.controller.js';
const usersRouter = Router();

const usersController = new UsersController();

usersRouter.get('/me', needSignIn, usersController.readMyInfo); // 내 정보 조회

export { usersRouter };
