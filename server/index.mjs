import express from 'express';
import cors from 'cors';
import session from 'express-session';
import supabase from './supabaseClient.js';
import authRouter from './routes/authRoutes.mjs';
import productRouter from './routes/productRoutes.mjs';
import profileRouter from './routes/profileRoutes.mjs';
import favoritesRouter from './routes/favoritesRoutes.mjs';
import cartRouter from './routes/cartRoutes.mjs';
import slidersRouter from './routes/slidersRoutes.mjs';
import categoriesRouter from './routes/categoriesRoutes.mjs';
import purchaseRoutes from './routes/purchaseRoutes.mjs';
import adminRouter from './routes/adminRouter.mjs';

const app = express();
app.use(express.json());
const PORT = 3002;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 // 24 часа
  }
}));

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/profile', profileRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/sliders', slidersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
