import express from 'express';
   import bcrypt from 'bcrypt';
   import session from 'express-session';
   import supabase from './supabaseClient.js';
   import { getSteamGameDetails } from './steamService.js';

   const router = express.Router();

   const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', req.session);
    if (req.session?.userId) {
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

   router.get('/admin-data', isAuthenticated, checkRole('admin'), (req, res) => {
       res.json({ data: 'Эти данные доступны только Админам' });
   });

   router.get('/user-data', isAuthenticated, checkRole('user'), (req, res) => {
       res.json({ data: 'Эти данные доступны только Пользователям' });
   });

   router.get('/profile', isAuthenticated, async (req, res) => {
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

   router.post('/products', isAuthenticated, checkRole('admin'), async (req, res) => {
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


router.put('/products/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
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

router.delete('/products/:id', isAuthenticated, checkRole('admin'), async (req, res) => {
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



router.get('/products/recommended', async (req, res) => {
    const limit = req.query.limit || 10;
    try {
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('recommended', true)
            .limit(parseInt(limit));

        if (productsError) throw productsError;

        // Get discount data
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


   router.get('/products/discounts', async (req, res) => {
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

  router.get('/products/new', async (req, res) => {
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
        console.error('Ошибка при получении данных о новых товарах:', error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) throw productError;
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const { data: discount, error: discountError } = await supabase
            .from('discounts')
            .select('discount_percent')
            .eq('product_id', productId)
            .gte('end_date', new Date().toISOString())
            .single();

        if (discountError) throw discountError;

        if (discount) {
            product.discount_percent = discount.discount_percent;
        }

        if (product.steamappid) {
            const steamDetails = await getSteamGameDetails(product.steamappid);
            if (steamDetails) {
                product.steamDetails = steamDetails;
            }
        }
        res.json(product);
    } catch (error) {
        console.error('Product fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/favorites', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    try {
        const { data: favorites, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', userId);

        if (error) throw error;

        const productIds = favorites.map(fav => fav.product_id);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (productsError) throw productsError;

        // Get discount data
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
        console.error('Ошибка при получении избранных товаров:', error);
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
        res.status(400).json({ error: 'Товар уже в избранном' });
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: userId, product_id: productId }]);
        res.json({ message: 'Товар добавлен в избранное' });
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара в избранное:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

  router.delete('/favorites/:productId', isAuthenticated, async (req, res) => {
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
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);
        res.json({ message: 'Товар удален из избранного' });
      } else {
        res.status(404).json({ error: 'Товар не найден в избранном' });
      }
    } catch (error) {
      console.error('Ошибка при удалении товара из избранного:', error);
      res.status(500).json({ error: 'Ошибка на сервере' });
    }
  });

  router.post('/cart', isAuthenticated, async (req, res) => {
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

  router.put('/cart/:productId', isAuthenticated, async (req, res) => {
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

  router.get('/cart', isAuthenticated, async (req, res) => {
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

   router.delete('/cart/:productId', isAuthenticated, async (req, res) => {
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

   router.get('/admin', isAuthenticated, checkRole('admin'), async (req, res) => {
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

   export default router;