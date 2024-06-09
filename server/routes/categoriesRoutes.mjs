import express from 'express';
import supabase from '../supabaseClient.js';

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;

    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении данных о категориях:', error);
    res.status(500).json({ error: 'Ошибка на сервере' });
  }
});

export default categoriesRouter;
