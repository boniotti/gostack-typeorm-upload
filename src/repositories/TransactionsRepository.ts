import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  transactions: Record<string, any>;
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });

    const { income, outcome } = transactions.reduce((acc: any, balance) => {
      const key = balance.type;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += balance.value;
      return acc;
    }, {});

    const total = (income || 0) - (outcome || 0);

    return {
      transactions: transactions.map(e => ({
        id: e.id,
        title: e.title,
        value: e.value,
        type: e.type,
        category: e.category.title,
      })),
      balance: {
        income,
        outcome,
        total,
      },
    };
  }
}

export default TransactionsRepository;
