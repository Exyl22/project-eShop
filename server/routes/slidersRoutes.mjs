import express from 'express';
import supabase from '../supabaseClient.js';

const slidersRouter = express.Router();

slidersRouter.get('/', async (req, res) => {
  try {
    const { data: sliders, error: slidersError } = await supabase
      .from('sliders')
      .select('id, product_id, image, description');

    if (slidersError) throw slidersError;

    const productIds = sliders.map(slider => slider.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (productsError) throw productsError;

    const slidersWithProductNames = sliders.map(slider => {
      const product = products.find(product => product.id === slider.product_id);
      return {
        ...slider,
        name: product ? product.name : 'Product Name Not Found'
      };
    });

    res.json(slidersWithProductNames);
  } catch (error) {
    console.error('Ошибка при получении данных о слайдерах:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default slidersRouter;
