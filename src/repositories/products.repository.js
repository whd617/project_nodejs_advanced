import * as HttpStatus from '../errors/http-status.errors.js';
import db from '../../models/index.cjs';
import { Sequelize } from 'sequelize';
const { Products, Users } = db;

export class ProductsRepository {
  createOne = async ({ title, description, userId }) => {
    const product = await Products.create({ title, description, userId });

    return product?.toJSON();
  };

  readMany = async ({ sort }) => {
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
      order: [['createdAt', sort]],
      include: { model: Users, as: 'user', attributes: [] },
    });
    return products.map((product) => product.toJSON());
  };

  readOneById = async (id) => {
    const product = await Products.findByPk(id, {
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

    if (!product) {
      throw new HttpStatus.NotFound('상품조회에 실패했습니다.');
    }

    return product?.toJSON();
  };

  updataeOneById = async (id, { title, description, status }) => {
    const product = await Products.findByPk(id);

    if (!product) {
      // 데이터를 찾지 못한 경우(404)
      throw new HttpStatus.NotFound('상품 조회에 실패했습니다.');
    }

    const updatedProduct = await product.update(
      {
        // 예) title이 있는경우 title값을 반환한다는 코드
        // 값이 있을 때에만 값을 추가하고 싶을 때 아래와 같은 표현식을 사용
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
      },
      { where: { id } },
    );
    return updatedProduct.toJSON();
  };

  deleteOneById = async (id) => {
    const product = await Products.findByPk(id);

    if (!product) {
      // 데이터를 찾지 못한 경우(404)
      throw new HttpStatus.NotFound('상품 조회에 실패했습니다.');
    }

    const deletedProduct = await product.destroy({
      where: { id },
    });

    return deletedProduct.toJSON();
  };
}
