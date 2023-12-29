import { Router } from 'express';
import { needSignIn } from '../middlewares/need-signin.middleware.js';
import { ProductsController } from '../controllers/products.controller.js';
const productsRouter = Router();

const productsController = new ProductsController();

productsRouter.post('', needSignIn, productsController.createOne); // 생성

productsRouter.get('', productsController.readMany); // 목록 조회

productsRouter.get('/:productId', productsController.readOne); // 상세 조회

productsRouter.put('/:productId', needSignIn, productsController.updateOne); // 수정

productsRouter.delete('/:productId', needSignIn, productsController.deleteOne); // 삭제

export { productsRouter };
