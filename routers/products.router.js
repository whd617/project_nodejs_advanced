import { Router } from 'express';
import { Sequelize } from 'sequelize';
import { needSignIn } from '../middlewares/need-signin.middleware.js';
import db from '../models/index.cjs';
const productsRouter = Router();
const { Products, Users } = db;
// 생성
productsRouter.post('', needSignIn, async (req, res) => {
  try {
    const { id: userId, name: userName } = res.locals.user;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: '제목 입력이 필요합니다.',
      });
    }
    if (!description) {
      return res.status(400).json({
        success: false,
        message: '설명 입력이 필요합니다.',
      });
    }

    const product = (
      await Products.create({ title, description, userId })
    ).toJSON();
    return res.status(201).json({
      success: true,
      message: '상품 생성에 성공했습니다.',
      data: { ...product, userName },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요.',
    });
  }
});
// 목록 조회
productsRouter.get('', async (req, res) => {
  try {
    const { sort } = req.query;
    let upperCaseSort = sort?.toUpperCase();

    if (upperCaseSort !== 'ASC' && upperCaseSort !== 'DESC') {
      upperCaseSort = 'DESC';
    }

    const products = await Products.findAll({
      attributes: [
        'id',
        'title',
        'description',
        'status',
        'userId',
        [Sequelize.col('user.name'), 'userName'],
        'createdAt',
        'updatedAt',
      ],
      order: [['createdAt', upperCaseSort]],
      include: { model: Users, as: 'user', attributes: [] },
    });

    console.log(
      products.map((product) => {
        product.toJSON();
      }),
    );

    return res.status(200).json({
      success: true,
      message: '상품 목록 조회에 성공했습니다.',
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요.',
    });
  }
});
// 상세 조회

productsRouter.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Products.findByPk(productId, {
      attributes: [
        'id',
        'title',
        'description',
        'status',
        'userId',
        [Sequelize.col('user.name'), 'userName'],
        'createdAt',
        'updatedAt',
      ],
      include: { model: Users, as: 'user', attributes: [] },
    });
    return res.status(200).json({
      success: true,
      message: '상품 목록 조회에 성공했습니다.',
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요.',
    });
  }
});

// 수정
productsRouter.put('/:productId', needSignIn, async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, status } = req.body;
    const { id: userId, name: userName } = res.locals.user;
    // 수정 정보가 하나도 없는 경우
    if (!title && !description && !status) {
      return res.status(400).json({
        success: false,
        message: '수정 정보는 최소 한 가지 이상이어야 합니다.',
      });
    }

    const isValidStatus = status
      ? status === 'FOR_SALE' || status === 'SOLD_OUT'
      : true;

    if (!isValidStatus) {
      return res.status(400).json({
        success: false,
        message: '지원하지 않는 상태입니다. (status: FOR_SALE | SOLD_OUT)',
      });
    }

    // 일치하는 상품이 존재하지 않을 경우
    const product = await Products.findByPk(productId);

    if (!product) {
      // 데이터를 찾지 못한 경우(404)
      return res.status(404).json({
        success: false,
        message: '상품 수정에 성공했습니다.',
        data: updatedProduct,
      });
    }

    // 작성자 Id와 인증 정보의 사용자 ID가 다른 경우
    const isProductOwner = product.userId === userId;
    // 데이터가 인증에는 성공하였으나 권한이 없는 경우(403)
    if (!isProductOwner) {
      return res.status(403).json({
        success: false,
        message: '상품 수정 권한이 없습니다.',
      });
    }

    await product.update(
      {
        // 예) title이 있는경우 title값을 반환한다는 코드
        // 값이 있을 때에만 값을 추가하고 싶을 때 아래와 같은 표현식을 사용
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
      },
      { where: { id: productId } },
    );

    const updatedProduct = {
      ...product.toJSON(),
      userName,
    };

    return res.status(200).json({
      success: true,
      message: '상품수정에 성공하였습니다.',
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요.',
    });
  }
});
// 삭제
productsRouter.delete('/:productId', needSignIn, async (req, res) => {
  try {
    const { productId } = req.params;
    const { id: userId, name: userName } = res.locals.user;
    const product = await Products.findByPk(productId);

    // 일치하는 상품이 존재하지 않는 경우
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품 조회에 실패했습니다.',
      });
    }

    // 작성자ID와 인증 정보의 사용자ID가 다른 경우
    const isProductOwner = product.userId === userId;
    if (!isProductOwner) {
      return res.status(403).json({
        success: false,
        message: '상품 삭제 권한이 없습니다.',
      });
    }

    await product.destroy({
      where: { id: productId },
    });

    const deletedProduct = {
      ...product.toJSON(),
      userName,
    };
    return res.status(200).json({
      success: true,
      message: '상품 삭제에 성공했습니다.',
      data: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '예상치 못한 에러가 발생하였습니다. 관리자에게 문의하세요.',
    });
  }
});

export { productsRouter };
