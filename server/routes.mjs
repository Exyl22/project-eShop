import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import supabase from './supabaseClient.js';

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', req.session);
    if (req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};


const checkRole = (roleName) => {
    return async (req, res, next) => {
        console.log('Checking role:', req.session);
        if (!req.session.roleId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('name')
                .eq('id', req.session.roleId)
                .single();

            if (error) throw error;

            if (data.name === roleName) {
                return next();
            } else {
                return res.status(403).json({ error: 'Forbidden' });
            }
        } catch (error) {
            console.error('Ошибка при проверке роли:', error);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
    };
};

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, email, password: hashedPassword, role_id: 2 }]);
  
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Имя пользователя или адрес электронной почты уже используются' });
        }
        throw error;
      }
  
      res.json({ message: 'Регистрация успешна' });
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      res.status(500).json({ error: 'Ошибка на сервере при регистрации пользователя' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body; 
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username); 

        if (error) throw error;
        if (users.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return res.status(401).json({ error: 'Неверный пароль' });

        req.session.userId = user.id;
        req.session.roleId = user.role_id;
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Ошибка на сервере при сохранении сессии' });
            }
            res.json({ message: 'Login successful', roleId: user.role_id });
        });
    } catch (error) {
        console.error('Ошибка при логине пользователя:', error);
        res.status(500).json({ error: 'Ошибка на сервере при логине пользователя' });
    }
}); 
router.get('/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.get('/admin-data', isAuthenticated, checkRole('Админ'), (req, res) => {
    res.json({ data: 'Эти данные доступны только Админам' });
});

router.get('/user-data', isAuthenticated, checkRole('Пользователь'), (req, res) => {
    res.json({ data: 'Эти данные доступны только Пользователям' });
});

router.get('/profile', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('username, email, avatar, description')
            .eq('id', userId)
            .single();

        if (error) throw error;

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.put('/profile', isAuthenticated, async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    const updates = { username, email };

    if (newPassword) {
        const { data: user, error } = await supabase
            .from('users')
            .select('password')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) return res.status(401).json({ error: 'Неверный текущий пароль' });

        updates.password = await bcrypt.hash(newPassword, 10);
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Профиль обновлен', ...updates });
    } catch (error) {
        console.error('Ошибка при обновлении данных пользователя:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе из системы' });
        }
        res.clearCookie('user_sid');
        return res.json({ message: 'Logout successful' });
    });
});

router.get('/sliders', async (req, res) => {
    try {
        const { data: sliders, error } = await supabase
            .from('sliders')
            .select('*');

        if (error) throw error;

        res.json(sliders);
    } catch (error) {
        console.error('Ошибка при получении данных о слайдерах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*');

        if (error) throw error;

        res.json(categories);
    } catch (error) {
        console.error('Ошибка при получении данных о слайдерах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/all-products', async (req, res) => {
    const { search, sortBy, order } = req.query; 
    try {
        let query = supabase.from('products').select('*');

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        if (sortBy) {
            query = query.order(sortBy, { ascending: order === 'asc' });
        }

        const { data: products, error } = await query;

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products', async (req, res) => {
    const { category, search, sortBy, order } = req.query;
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

        const { data: products, error } = await query;

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products/recommended', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('recommended', true)
            .limit(parseInt(limit));

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о рекомендованных товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products/discounts', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('discounts', true)
            .limit(parseInt(limit));

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о рекомендованных товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products/new', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('new', true)
            .limit(parseInt(limit));

        if (error) throw error;

        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении данных о рекомендованных товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        if (!product) return res.status(404).json({ error: 'Товар не найден' });

        res.json(product);
    } catch (error) {
        console.error('Ошибка при получении данных о товаре:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});
router.post('/favorites/:productId', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.productId;
    try {
        const { data: existingFavorite } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existingFavorite) {
            await supabase
                .from('favorites')
                .delete()
                .eq('id', existingFavorite.id);
            res.json({ message: 'Товар удален из избранного' });
        } else {
            await supabase
                .from('favorites')
                .insert([{ user_id: userId, product_id: productId }]);
            res.json({ message: 'Товар добавлен в избранное' });
        }
    } catch (error) {
        console.error('Ошибка при обработке избранного:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});
router.post('/cart', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;
    try {
        const { data, error } = await supabase
            .from('cart')
            .insert([{ user_id: userId, product_id: productId, quantity }]);

        if (error) throw error;

        res.json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/cart', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    try {
        const { data: cart, error } = await supabase
            .from('cart')
            .select('*, products(*)')
            .eq('user_id', userId);

        if (error) throw error;

        res.json(cart);
    } catch (error) {
        console.error('Ошибка при получении данных о корзине:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.post('/steam-games', async (req, res) => {
    try {
        const { gameId } = req.body;
        const gameDetails = await getSteamGameDetails(gameId);
        res.json(gameDetails);
    } catch (error) {
        console.error('Ошибка при получении данных о игре Steam:', error);
        res.status(500).json({ error: 'Ошибка при получении данных о игре Steam' });
    }
});

router.get('/steam-game/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const gameDetails = await getSteamGameDetails(appId);
        res.json(gameDetails);
    } catch (error) {
        console.error('Ошибка при получении данных о игре Steam:', error);
        res.status(500).json({ error: 'Ошибка при получении данных о игре Steam' });
    }
});

export default router;