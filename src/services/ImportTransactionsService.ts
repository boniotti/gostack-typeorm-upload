import { getRepository } from 'typeorm';

import csv from 'csvtojson';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const data = await csv({
      flatKeys: true,
      colParser: { value: { flat: true, cellParser: 'number' } },
    })
      .fromFile(file.path)
      .subscribe(async (obj, _index) => {
        const dataJSON = obj;
        const { title, value, type, category } = obj;

        const exists = await categoriesRepository.findOne({
          title: category,
        });

        if (!exists) {
          const newCategory = categoriesRepository.create({
            title: category,
          });
          await categoriesRepository.save(newCategory);
        }

        const categoryId = await categoriesRepository.findOne({
          title: category,
        });

        if (categoryId) {
          const transactions = transactionsRepository.create({
            title,
            value,
            type,
            category_id: categoryId.id,
          });

          await transactionsRepository.save(transactions);

          dataJSON.uuid = transactions.id;
        }
      });
    return data;
  }
}

export default ImportTransactionsService;
