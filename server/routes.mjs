import express from 'express';
import bcrypt from 'bcrypt';
import db from './db.mjs';
import { getSteamGameDetails } from './steamUtils.mjs';

const router = express.Router();

const checkRole = (roleName) => {
    return (req, res, next) => {
        const SQL = 'SELECT name FROM Roles WHERE id = ?';
        db.query(SQL, [req.session.roleId], (err, result) => {
            if (err) {
                console.error('Ошибка при проверке роли:', err);
                return res.status(500).json({ error: "Ошибка на сервере" });
            }
            if (result.length > 0 && result[0].name === roleName) {
                return next();
            } else {
                return res.status(403).json('Forbidden');
            }
        });
    };
};

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    } else {
        return res.status(401).json('Unauthorized');
    }
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const SQL = 'SELECT * FROM Users WHERE username = ?';
    db.query(SQL, [username], (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка на сервере" });
        if (data.length > 0) {
            const user = data[0];
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (passwordMatch) {
                req.session.userId = user.id;
                req.session.roleId = user.role_id;
                return res.json({ message: 'Login successful', roleId: user.role_id });
            } else {
                return res.status(401).json({ error: "Неверный пароль" });
            }
        } else {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
    });
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const usernameSQL = 'SELECT * FROM Users WHERE username = ?';
    const emailSQL = 'SELECT * FROM Users WHERE email = ?';

    db.query(usernameSQL, [username], (err, usernameData) => {
        if (err) return res.status(500).json({ error: "Ошибка на сервере" });
        if (usernameData.length > 0) return res.status(409).json({ error: "Такой логин уже существует" });

        db.query(emailSQL, [email], (err, emailData) => {
            if (err) return res.status(500).json({ error: "Ошибка на сервере" });
            if (emailData.length > 0) return res.status(409).json({ error: "Эта почта уже используется" });

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return res.status(500).json({ error: "Ошибка при хэшировании пароля" });

                const insertSQL = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
                db.query(insertSQL, [username, email, hashedPassword], (err, data) => {
                    if (err) return res.status(500).json({ error: "Ошибка на сервере" });
                    return res.json({ message: "Регистрация успешна" });
                });
            });
        });
    });
});

router.get('/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.put('/profile', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const { username, email, password } = req.body;
    const userId = req.session.userId;
    
    let updateSQL = 'UPDATE Users SET username = ?, email = ? WHERE id = ?';
    let queryParams = [username, email, userId];
  
    if (password) {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Ошибка при хэшировании пароля' });
  
        updateSQL = 'UPDATE Users SET username = ?, email = ?, password = ? WHERE id = ?';
        queryParams = [username, email, hashedPassword, userId];
  
        db.query(updateSQL, queryParams, (err, result) => {
          if (err) {
            console.error('Ошибка при обновлении данных пользователя:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
          }
  
          const SQL = 'SELECT username, email FROM Users WHERE id = ?';
          db.query(SQL, [userId], (err, result) => {
            if (err) {
              console.error('Ошибка при получении данных пользователя:', err);
              return res.status(500).json({ error: 'Ошибка на сервере' });
            }
  
            return res.json(result[0]);
          });
        });
      });
    } else {
      db.query(updateSQL, queryParams, (err, result) => {
        if (err) {
          console.error('Ошибка при обновлении данных пользователя:', err);
          return res.status(500).json({ error: 'Ошибка на сервере' });
        }
  
        const SQL = 'SELECT username, email FROM Users WHERE id = ?';
        db.query(SQL, [userId], (err, result) => {
          if (err) {
            console.error('Ошибка при получении данных пользователя:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
          }
  
          return res.json(result[0]);
        });
      });
    }
});

router.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.userId;

    const SQL = 'SELECT username, email FROM Users WHERE id = ?';
    db.query(SQL, [userId], (err, result) => {
        if (err) {
            console.error('Ошибка при получении данных пользователя:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        return res.json(result[0]);
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Ошибка при выходе из системы" });
        }
        res.clearCookie('user_sid');
        return res.json({ message: "Logout successful" });
    });
});

router.get('/products', (req, res) => {
    const limit = req.query.limit || 10;
    db.query(`SELECT * FROM products LIMIT ${limit}`, (err, result) => {
        if (err) {
            console.error('Ошибка при получении данных о товарах:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/products/recommended', (req, res) => {
    db.query('SELECT * FROM Products WHERE recommended = 1', (err, result) => {
        if (err) {
            console.error('Ошибка при получении рекомендуемых товаров:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/products/discounts', (req, res) => {
    db.query('SELECT * FROM Products WHERE discount > 0', (err, result) => {
        if (err) {
            console.error('Ошибка при получении товаров со скидкой:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/products/new', (req, res) => {
    db.query('SELECT * FROM Products WHERE new = 1', (err, result) => {
        if (err) {
            console.error('Ошибка при получении новых товаров:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/sliders', (req, res) => {
    const SQL = `
        SELECT Sliders.*, Products.name, Sliders.image as product_image 
        FROM Sliders 
        JOIN Products ON Sliders.product_id = Products.id
    `;
    db.query(SQL, (err, result) => {
        if (err) {
            console.error('Ошибка при получении слайдов:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/products/:id', (req, res) => {
    const { id } = req.params;

    const productQuery = 'SELECT * FROM Products WHERE id = ?';
    const reviewsQuery = 'SELECT author, content FROM Reviews WHERE product_id = ?';

    db.query(productQuery, [id], (err, productResult) => {
        if (err) {
            console.error('Ошибка при получении данных о товаре:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        if (productResult.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const product = productResult[0];

        db.query(reviewsQuery, [id], (err, reviewsResult) => {
            if (err) {
                console.error('Ошибка при получении отзывов:', err);
                return res.status(500).json({ error: 'Ошибка на сервере' });
            }

            product.reviews = reviewsResult;
            res.json(product);
        });
    });
});

router.get('/all-products', (req, res) => {
    let SQL = 'SELECT * FROM Products';
    const filters = [];
    const queryParams = [];

    if (req.query.category && req.query.category !== 'all-products') {
        filters.push('category = ?');
        queryParams.push(req.query.category);
    }

    if (req.query.recommended === 'true') {
        filters.push('recommended = 1');
    }

    if (req.query.discount === 'true') {
        filters.push('discount > 0');
    }

    if (req.query.new === 'true') {
        filters.push('new = 1');
    }

    if (req.query.search) {
        filters.push('name LIKE ?');
        queryParams.push(`%${req.query.search}%`);
    }

    if (filters.length > 0) {
        SQL += ' WHERE ' + filters.join(' AND ');
    }

    if (req.query.sortBy) {
        const sortColumn = req.query.sortBy;
        const sortOrder = req.query.order === 'desc' ? 'DESC' : 'ASC';
        SQL += ` ORDER BY ${sortColumn} ${sortOrder}`;
    }

    db.query(SQL, queryParams, (err, result) => {
        if (err) {
            console.error('Ошибка при получении данных о товарах:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.get('/categories', (req, res) => {
    const SQL = 'SELECT * FROM Categories';
    db.query(SQL, (err, result) => {
        if (err) {
            console.error('Ошибка при получении категорий:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});


router.post('/favorites', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.body;

    const checkSQL = 'SELECT * FROM Favorites WHERE user_id = ? AND product_id = ?';
    db.query(checkSQL, [userId, productId], (err, results) => {
        if (err) {
            console.error('Ошибка при проверке избранного:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Товар уже в избранном' });
        }

        const insertSQL = 'INSERT INTO Favorites (user_id, product_id) VALUES (?, ?)';
        db.query(insertSQL, [userId, productId], (err, result) => {
            if (err) {
                console.error('Ошибка при добавлении товара в избранное:', err);
                return res.status(500).json({ error: 'Ошибка на сервере' });
            }
            res.json({ message: 'Товар добавлен в избранное' });
        });
    });
});

router.delete('/favorites/:productId', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;

    const SQL = 'DELETE FROM Favorites WHERE user_id = ? AND product_id = ?';
    db.query(SQL, [userId, productId], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении товара из избранного:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json({ message: 'Товар удален из избранного' });
    });
});

router.get('/favorites', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    const SQL = `
        SELECT Products.* FROM Favorites
        JOIN Products ON Favorites.product_id = Products.id
        WHERE Favorites.user_id = ?
    `;
    db.query(SQL, [userId], (err, result) => {
        if (err) {
            console.error('Ошибка при получении избранных товаров:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.post('/cart', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    const checkSQL = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(checkSQL, [userId, productId], (err, results) => {
        if (err) {
            console.error('Ошибка при проверке корзины:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }

        if (results.length > 0) {
            const updateSQL = 'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            db.query(updateSQL, [quantity, userId, productId], (err, result) => {
                if (err) {
                    console.error('Ошибка при обновлении количества товара в корзине:', err);
                    return res.status(500).json({ error: 'Ошибка на сервере' });
                }
                res.json({ message: 'Количество товара в корзине обновлено' });
            });
        } else {
            const insertSQL = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(insertSQL, [userId, productId, quantity], (err, result) => {
                if (err) {
                    console.error('Ошибка при добавлении товара в корзину:', err);
                    return res.status(500).json({ error: 'Ошибка на сервере' });
                }
                res.json({ message: 'Товар добавлен в корзину' });
            });
        }
    });
});

router.delete('/cart/:productId', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;

    const SQL = 'DELETE FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(SQL, [userId, productId], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении товара из корзины:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json({ message: 'Товар удален из корзины' });
    });
});

router.post('/cart', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    const checkSQL = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(checkSQL, [userId, productId], (err, results) => {
        if (err) {
            console.error('Ошибка при проверке корзины:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }

        if (results.length > 0) {
            const updateSQL = 'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            db.query(updateSQL, [quantity, userId, productId], (err, result) => {
                if (err) {
                    console.error('Ошибка при обновлении количества товара в корзине:', err);
                    return res.status(500).json({ error: 'Ошибка на сервере' });
                }
                res.json({ message: 'Количество товара в корзине обновлено' });
            });
        } else {
            const insertSQL = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(insertSQL, [userId, productId, quantity], (err, result) => {
                if (err) {
                    console.error('Ошибка при добавлении товара в корзину:', err);
                    return res.status(500).json({ error: 'Ошибка на сервере' });
                }
                res.json({ message: 'Товар добавлен в корзину' });
            });
        }
    });
});

router.get('/cart', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    const SQL = `
        SELECT Products.*, Cart.quantity FROM Cart
        JOIN Products ON Cart.product_id = Products.id
        WHERE Cart.user_id = ?
    `;
    db.query(SQL, [userId], (err, result) => {
        if (err) {
            console.error('Ошибка при получении товаров корзины:', err);
            return res.status(500).json({ error: 'Ошибка на сервере' });
        }
        res.json(result);
    });
});

router.put('/cart/:productId', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
  
    const updateSQL = 'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
    db.query(updateSQL, [quantity, userId, productId], (err, result) => {
      if (err) {
        console.error('Ошибка при обновлении количества товара в корзине:', err);
        return res.status(500).json({ error: 'Ошибка на сервере' });
      }
      res.json({ message: 'Количество товара в корзине обновлено' });
    });
  });
  
router.get('/steam-game/:appId', async (req, res) => {
    const { appId } = req.params;
    console.log('Fetching Steam game details for appId:', appId); // Отладочная информация
    try {
      const gameData = await getSteamGameDetails(appId);
      if (gameData) {
        res.json(gameData);
      } else {
        res.status(404).json({ error: 'Game details not found for the provided appId' });
      }
    } catch (error) {
      console.error('Error fetching game details from Steam:', error); // Отладочная информация
      res.status(500).json({ error: 'Error fetching game details from Steam' });
    }
});

export default router;
