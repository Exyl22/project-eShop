import supabase from '../supabaseClient.js';

export const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication:', req.session);
    if (req.session?.userId) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export const checkRole = (roleName) => {
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
