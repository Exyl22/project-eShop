import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { getSteamGameDetails } from './steamUtils.mjs';
import db from './db.mjs';
import routes from './routes.mjs';
import mysql from 'mysql';
import dotenv from 'dotenv';

// Загружаем переменные окружения из файла .env
dotenv.config();

const app = express();

// Настройка подключения к базе данных MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Используем Express JSON middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(routes);

// Пример маршрута для работы с базой данных
app.get('/api/games', (req, res) => {
  connection.query('SELECT * FROM games', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.listen(3002, () => {
    console.log('Server is running on port 3002');
});
