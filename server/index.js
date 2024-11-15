import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import Routes from './routes/Routes.js';

dotenv.config();
const app = express();
app.use(cors(
    {
        origin: ["https://aimsps.vercel.app/","http://localhost:5173/"],
        methods: ["POST", "GET","PUT","DELETE"],
        credentials: true
    }
));
app.use(express.json());

mongoose.connect('mongodb+srv://skv6621:skv6621@cluster0.618s2.mongodb.net/TYIT-PROJECT?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Connected to MongoDB');
        console.log(process.env.URL)
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Middleware to handle larger payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Define routes
app.use('/api', Routes);

app.get('/', (req, res) => {
    res.status(200).json({server:"Server is running"})
  });  


const PORT = process.env.PORT||4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  
