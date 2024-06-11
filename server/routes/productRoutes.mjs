import express from 'express';
import supabase from '../supabaseClient.js';
import { getSteamGameDetails } from '../steamService.js';

const productRouter = express.Router();

// Routes for fetching products
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

        const productsWithDiscountsAndSteamDetails = await Promise.all(products.map(async product => {
            const discount = discounts.find(discount => discount.product_id === product.id);
            product.discount_percent = discount ? discount.discount_percent : null;

            if (product.steamappid) {
                const steamDetails = await getSteamGameDetails(product.steamappid);
                if (steamDetails) {
                    product.steamDetails = steamDetails;
                }
            }

            return product;
        }));

        console.log('Products with Steam details:', productsWithDiscountsAndSteamDetails);

        res.json(productsWithDiscountsAndSteamDetails);
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

        console.log('Product data with Steam details:', product); // Debugging

        res.json(product);
    } catch (error) {
        console.error('Ошибка при получении данных о продукте:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

export default productRouter;
