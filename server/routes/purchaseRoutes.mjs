import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated } from '../middlewares.mjs';

const purchaseRoutes = express.Router();


purchaseRoutes.post('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
  }

  try {
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (cartError) throw cartError;

    const transactions = cartItems.map(item => ({
      user_id: userId,
      product_id: item.product_id,
      amount: item.products.price * (1 - (item.discount_percent || 0) / 100),
    }));

    const { data: transactionRecords, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (transactionError) throw transactionError;

    const purchasedProducts = cartItems.map(item => ({
      user_id: userId,
      product_id: item.product_id,
    }));

    const { error: purchasedError } = await supabase
      .from('purchased_products')
      .insert(purchasedProducts);

    if (purchasedError) throw purchasedError;

    for (const item of cartItems) {
      const { data: availableKeys, error: keyError } = await supabase
        .from('keys')
        .select('*')
        .eq('product_id', item.product_id)
        .is('user_id', null)
        .limit(1);

      if (keyError) throw keyError;

      if (availableKeys.length === 0) {
        throw new Error(`Нет доступных ключей для продукта с ID: ${item.product_id}`);
      }

      await supabase
        .from('keys')
        .update({ user_id: userId, assigned_at: new Date().toISOString() })
        .eq('id', availableKeys[0].id);
    }

    const { error: clearCartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (clearCartError) throw clearCartError;

    res.json({ message: 'Покупка успешно завершена' });
  } catch (error) {
    console.error('Ошибка при оформлении покупки:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default purchaseRoutes;
