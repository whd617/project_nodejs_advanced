import { Router } from 'express';
import { needSignIn } from '../middlewares/need-signin.middleware.js';
import { ProductsController } from '../controllers/products.controller.js';
const productsRouter = Router();

const productsController = new ProductsController();

// 생성
productsRouter.post('', needSignIn, productsController.createOne);
// 목록 조회
productsRouter.get('', productsController.readMany);
// 상세 조회
productsRouter.get('/:productId', productsController.readOne);
// 수정
productsRouter.put('/:productId', needSignIn, productsController.updateOne);
// 삭제
productsRouter.delete('/:productId', needSignIn, productsController.deleteOne);

export { productsRouter };
