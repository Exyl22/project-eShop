import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated } from '../middlewares.mjs';

const profileRouter = express.Router();

profileRouter.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('username, email, avatar, description, role_id')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', user.role_id)
      .single();

    if (roleError) throw roleError;

    res.json({ ...user, role: roleData.name });
  } catch (error) {
    console.error('Ошибка при получении данных профиля:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});


profileRouter.get('/purchased', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const { data: purchasedProducts, error: purchasedError } = await supabase
      .from('purchased_products')
      .select('product_id, purchase_date')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (purchasedError) throw purchasedError;

    const { data: countData, error: countError } = await supabase
      .from('purchased_products')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (countError) throw countError;

    const totalPages = Math.ceil(countData.length / limit);

    const products = await Promise.all(purchasedProducts.map(async pp => {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name')
        .eq('id', pp.product_id)
        .single();

      if (productError) throw productError;

      const { data: key, error: keyError } = await supabase
        .from('keys')
        .select('key')
        .eq('product_id', pp.product_id)
        .eq('user_id', userId)
        .single();

      if (keyError) throw keyError;

      return {
        id: pp.product_id,
        name: product.name,
        purchase_date: pp.purchase_date,
        key: key.key
      };
    }));

    res.json({ products, totalPages });
  } catch (error) {
    console.error('Ошибка при получении купленных товаров:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

profileRouter.get('/transactions', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('product_id, transaction_date, amount')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (transactionsError) throw transactionsError;

    const { data: countData, error: countError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (countError) throw countError;

    const totalPages = Math.ceil(countData.length / limit);

    const transactionDetails = await Promise.all(transactions.map(async tx => {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name')
        .eq('id', tx.product_id)
        .single();

      if (productError) throw productError;

      return {
        id: tx.product_id,
        name: product.name,
        transaction_date: tx.transaction_date,
        amount: tx.amount
      };
    }));

    res.json({ transactions: transactionDetails, totalPages });
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});
export default profileRouter;
