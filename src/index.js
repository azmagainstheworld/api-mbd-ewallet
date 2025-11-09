import express from 'express';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import userRoute from './routes/userRoute.js';
import transaksiRoute from './routes/transaksiRoute.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({
        msg: "Hello World",
        subject: "Manajemen Basis Data"
    });
});

app.use('/user', userRoute);
app.use('/transaksi', transaksiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});