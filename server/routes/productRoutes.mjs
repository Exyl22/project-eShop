import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated, checkRole } from '../middlewares.mjs';
import { getSteamGameDetails } from '../steamService.js';

const productRouter = express.Router();

productRouter.get('/recommended', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('recommended', true)
        .limit(parseInt(limit));
  
      if (productsError) throw productsError;
  
      const productIds = products.map(product => product.id);
      const { data: discounts, error: discountsError } = await supabase
        .from('discounts')
        .select('product_id, discount_percent, start_date, end_date')
        .in('product_id', productIds)
        .gte('end_date', new Date().toISOString());
  
      if (discountsError) throw discountsError;
  
      const productsWithDiscounts = products.map(product => {
        const discount = discounts.find(discount => discount.product_id === product.id);
        return {
          ...product,
          discount_percent: discount ? discount.discount_percent : null
        };
      });
  
      res.json(productsWithDiscounts);
    } catch (error) {
      console.error('Ошибка при получении данных о рекомендованных товарах:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });
  
  productRouter.get('/new', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('new', true)
        .limit(parseInt(limit));
  
      if (productsError) throw productsError;
  
      const productIds = products.map(product => product.id);
      const { data: discounts, error: discountsError } = await supabase
        .from('discounts')
        .select('product_id, discount_percent, start_date, end_date')
        .in('product_id', productIds)
        .gte('end_date', new Date().toISOString());
  
      if (discountsError) throw discountsError;
  
      const productsWithDiscounts = products.map(product => {
        const discount = discounts.find(discount => discount.product_id === product.id);
        return {
          ...product,
          discount_percent: discount ? discount.discount_percent : null
        };
      });
  
      res.json(productsWithDiscounts);
    } catch (error) {
      console.error('Ошибка при получении данных о рекомендованных товарах:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

  productRouter.get('/discounts', async (req, res) => {
    try {
      const { data: discounts, error: discountsError } = await supabase
        .from('discounts')
        .select('product_id, discount_percent, start_date, end_date')
        .gte('end_date', new Date().toISOString());
  
      if (discountsError) throw discountsError;
  
      const productIds = discounts.map(discount => discount.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
  
      if (productsError) throw productsError;
  
      const productsWithDiscounts = products.map(product => {
        const discount = discounts.find(discount => discount.product_id === product.id);
        return {
          ...product,
          discount_percent: discount ? discount.discount_percent : null
        };
      });
  
      res.json(productsWithDiscounts);
    } catch (error) {
      console.error('Ошибка при получении данных о товарах со скидками:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });


  productRouter.get('/', async (req, res) => {
    const { category, search, sortBy, order, limit } = req.query;
    try {
      let query = supabase.from('products').select('*');
  
      if (category) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();
  
        if (categoryError) throw categoryError;
  
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }
  
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
  
      if (sortBy) {
        query = query.order(sortBy, { ascending: order === 'asc' });
      }
  
      if (limit) {
        query = query.limit(parseInt(limit));
      }
  
      const { data: products, error: productsError } = await query;
  
      if (productsError) throw productsError;
  
      const productIds = products.map(product => product.id);
      const { data: discounts, error: discountsError } = await supabase
        .from('discounts')
        .select('product_id, discount_percent, start_date, end_date')
        .in('product_id', productIds)
        .gte('end_date', new Date().toISOString());
  
      if (discountsError) throw discountsError;
  
      const productsWithDiscounts = products.map(product => {
        const discount = discounts.find(discount => discount.product_id === product.id);
        return {
          ...product,
          discount_percent: discount ? discount.discount_percent : null
        };
      });
  
      res.json(productsWithDiscounts);
    } catch (error) {
      console.error('Ошибка при получении данных о товарах:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

  productRouter.get('/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
  
      if (productError) throw productError;
      if (!product) return res.status(404).json({ error: 'Продукт не найден' });
  
      const { data: discount, error: discountError } = await supabase
        .from('discounts')
        .select('discount_percent')
        .eq('product_id', productId)
        .gte('end_date', new Date().toISOString())
        .single();
  
      if (discountError && discountError.code !== 'PGRST116') throw discountError;
  
      product.discount_percent = discount ? discount.discount_percent : null;
  
      if (product.steamappid) {
        const steamDetails = await getSteamGameDetails(product.steamappid);
        if (steamDetails) {
          product.steamDetails = steamDetails;
        }
      }
  
      res.json(product);
    } catch (error) {
      console.error('Ошибка при получении данных о продукте:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

  
  productRouter.post('/', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { name, description, price } = req.body;
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, description, price }]);
  
      if (error) throw error;
  
      res.json({ message: 'Продукт добавлен', data });
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });
  

  productRouter.get('/admin', isAuthenticated, checkRole('admin'), async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

productRouter.post('/', isAuthenticated, checkRole('admin'), async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price }]);

    if (error) throw error;

    res.json({ message: 'Продукт добавлен', data });
  } catch (error) {
    console.error('Ошибка при добавлении продукта:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

productRouter.put('/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ name, description, price })
        .eq('id', id);
  
      if (error) throw error;
  
      res.json({ message: 'Продукт обновлен', data });
    } catch (error) {
      console.error('Ошибка при обновлении продукта:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

productRouter.delete('/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Продукт удален', data });
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default productRouter;
