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
  try {
    const { data: purchasedProducts, error } = await supabase
      .from('purchased_products')
      .select('product_id, purchase_date, products(name), keys(key)')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    const products = purchasedProducts.map(pp => ({
      id: pp.product_id,
      name: pp.products.name,
      purchase_date: pp.purchase_date,
      key: pp.keys.key
    }));

    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении купленных товаров:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

profileRouter.get('/purchased', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: purchasedProducts, error } = await supabase
      .from('purchased_products')
      .select('product_id, purchase_date, products(name), keys(key)')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    const products = purchasedProducts.map(pp => ({
      id: pp.product_id,
      name: pp.products.name,
      purchase_date: pp.purchase_date,
      key: pp.keys.key
    }));

    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении купленных товаров:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

profileRouter.get('/transactions', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('product_id, transaction_date, amount, products(name)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    const transactionDetails = transactions.map(tx => ({
      id: tx.product_id,
      name: tx.products.name,
      transaction_date: tx.transaction_date,
      amount: tx.amount
    }));

    res.json(transactionDetails);
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default profileRouter;
