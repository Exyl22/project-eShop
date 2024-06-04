import express from 'express';
import cors from 'cors';
import session from 'express-session';
import supabase from './supabaseClient.js';
import routes from './routes.mjs'; 

const app = express();
const PORT = 3002;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false, 
      httpOnly: true
  }
}));
app.use('/api', (req, res, next) => {
  console.log(`Incoming request to: ${req.url}`);
  next();
}, routes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 