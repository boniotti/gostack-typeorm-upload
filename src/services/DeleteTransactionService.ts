import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const exists = await transactionsRepository.findOne(id);

    if (!exists) {
      throw new AppError('Transaction not found', 400);
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
