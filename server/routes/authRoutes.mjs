import express from 'express';
import bcrypt from 'bcrypt';
import supabase from '../supabaseClient.js';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
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

authRouter.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе из системы' });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logout successful' });
    });
});

authRouter.get('/check', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

export default authRouter;
