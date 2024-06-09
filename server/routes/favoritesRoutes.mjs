import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated, checkRole } from '../middlewares.mjs';

const favoritesRoutes = express.Router();

favoritesRoutes.get('/', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
    }
    try {
        const { data: favorites, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Ошибка при получении избранных товаров:', error);
            throw error;
        }

        const productIds = favorites.map(fav => fav.product_id);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (productsError) {
            console.error('Ошибка при получении продуктов:', productsError);
            throw productsError;
        }

        const { data: discounts, error: discountsError } = await supabase
            .from('discounts')
            .select('product_id, discount_percent, start_date, end_date')
            .in('product_id', productIds)
            .gte('end_date', new Date().toISOString());

        if (discountsError) {
            console.error('Ошибка при получении скидок:', discountsError);
            throw discountsError;
        }

        const productsWithDiscounts = products.map(product => {
            const discount = discounts.find(discount => discount.product_id === product.id);
            return {
                ...product,
                discount_percent: discount ? discount.discount_percent : null
            };
        });

        res.json(productsWithDiscounts);
    } catch (error) {
        console.error('Ошибка при получении избранных товаров:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

favoritesRoutes.post('/:productId', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.productId;
    try {
      const { data: existingFavorite, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
  
      if (error) throw error;
  
      if (existingFavorite) {
        res.status(400).json({ error: 'Товар уже в избранном' });
      } else {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, product_id: productId }]);
        if (insertError) throw insertError;
        res.json({ message: 'Товар добавлен в избранное' });
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара в избранное:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

favoritesRoutes.delete('/:productId', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.productId;
    try {
      const { data: existingFavorite, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
  
      if (error) throw error;
  
      if (existingFavorite) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);
        if (deleteError) throw deleteError;
        res.json({ message: 'Товар удален из избранного' });
      } else {
        res.status(404).json({ error: 'Товар не найден в избранном' });
      }
    } catch (error) {
      console.error('Ошибка при удалении товара из избранного:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

export default favoritesRoutes;
