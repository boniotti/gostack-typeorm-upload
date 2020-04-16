import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  balance: Record<string, any>;
}

interface Response {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    balance,
  }: Request): Promise<Response> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    let newCategory: Record<string, any> = {};

    const { total } = balance;

    if (type === 'outcome' && total < value) {
      throw new AppError(`Sorry, you don't have enough balance`, 400);
    }

    const exists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!exists) {
      const createCategory = categoriesRepository.create({
        title: category,
      });
      newCategory = await categoriesRepository.save(createCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: exists ? exists.id : newCategory.id,
    });

    await transactionsRepository.save(transaction);

    delete transaction.category_id;
    delete transaction.created_at;
    delete transaction.updated_at;

    return {
      ...transaction,
      category,
    };
  }
}

export default CreateTransactionService;
