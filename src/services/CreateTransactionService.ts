import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
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
    category: categoryTitle,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (
      value > (await (await transactionsRepository.getBalance()).total) &&
      type === 'outcome'
    ) {
      throw new AppError("You don't have balance");
    }

    const categoriesRepository = getRepository(Category);
    let category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });
    if (!category) {
      category = categoriesRepository.create({ title: categoryTitle });
      category = await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
