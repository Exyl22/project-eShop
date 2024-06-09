import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated } from '../middlewares.mjs';

const cartRouter = express.Router();

cartRouter.post('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { productId, quantity } = req.body;
  try {
    const { data: existingCartItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingCartItem) {
      await supabase
        .from('cart')
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq('id', existingCartItem.id);
      res.json({ message: 'Количество товара в корзине обновлено' });
    } else {
      await supabase
        .from('cart')
        .insert([{ user_id: userId, product_id: productId, quantity }]);
      res.json({ message: 'Товар добавлен в корзину' });
    }
  } catch (error) {
    console.error('Ошибка при добавлении товара в корзину:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

cartRouter.put('/:productId', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const productId = req.params.productId;
  const { quantity } = req.body;
  try {
    const { data: existingCartItem, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) throw error;

    if (existingCartItem) {
      await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', existingCartItem.id);
      res.json({ message: 'Количество товара в корзине обновлено' });
    } else {
      res.status(404).json({ error: 'Товар не найден в корзине' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении количества товара в корзине:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

cartRouter.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const { data: cart, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    const productIds = cart.map(item => item.product_id);
    const { data: discounts, error: discountsError } = await supabase
      .from('discounts')
      .select('product_id, discount_percent')
      .in('product_id', productIds)
      .gte('end_date', new Date().toISOString());

    if (discountsError) throw discountsError;

    const cartWithDiscounts = cart.map(item => {
      const discount = discounts.find(discount => discount.product_id === item.product_id);
      return {
        ...item,
        discount_percent: discount ? discount.discount_percent : null
      };
    });

    res.json(cartWithDiscounts);
  } catch (error) {
    console.error('Ошибка при получении данных о корзине:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

cartRouter.delete('/:productId', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const productId = req.params.productId;
  try {
    const { data: existingCartItem, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) throw error;

    if (existingCartItem) {
      await supabase
        .from('cart')
        .delete()
        .eq('id', existingCartItem.id);
      res.json({ message: 'Товар удален из корзины' });
    } else {
      res.status(404).json({ error: 'Товар не найден в корзине' });
    }
  } catch (error) {
    console.error('Ошибка при удалении товара из корзины:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default cartRouter;
