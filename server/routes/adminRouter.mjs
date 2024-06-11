import express from 'express';
import supabase from '../supabaseClient.js';
import { isAuthenticated, checkRole } from '../middlewares.mjs';
import { getSteamGameDetails } from '../steamService.js';

const adminRouter = express.Router();

// Fetch all products (Admin access)
adminRouter.get('/products', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
  
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .range(offset, offset + limit - 1);
        
        if (error) throw error;

        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        res.json({ products, total: count });
    } catch (error) {
        console.error('Ошибка при получении данных о товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

// Add a new product (Admin access)
adminRouter.post('/products', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { name, description, price, image, recommended, new: isNew, banner, category, steamappid } = req.body;
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, description, price, image, recommended, new: isNew, banner, category, steamappid }]);

        if (error) throw error;

        res.json({ message: 'Продукт добавлен', data });
    } catch (error) {
        console.error('Ошибка при добавлении продукта:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});



// Update a product (Admin access)
adminRouter.put('/products/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image, recommended, new: isNew, banner, category, steamappid } = req.body;
    try {
        const { data, error } = await supabase
            .from('products')
            .update({ name, description, price, image, recommended, new: isNew, banner, category, steamappid })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Продукт обновлен', data });
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

// Delete a product (Admin access)
adminRouter.delete('/products/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
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

adminRouter.get('/steamgame/:appId', isAuthenticated, checkRole('admin'), async (req, res) => {
    const { appId } = req.params;
    try {
        const gameDetails = await getSteamGameDetails(appId);
        if (gameDetails) {
            res.json(gameDetails);
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        console.error('Ошибка при получении данных из Steam:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

export default adminRouter;
