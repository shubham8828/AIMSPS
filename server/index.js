import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import Routes from './routes/Routes.js';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

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

mongoose.connect("mongodb+srv://skv6621:skv6621@cluster0.618s2.mongodb.net/TYIT-PROJECT?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Initialize the WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] } // Use headless to avoid browser context issues
});

client.on('qr', (qr) => {
    // Generate and display QR code in the terminal
    qrcode.generate(qr, { small: true });
    console.log('QR code generated. Please scan to authenticate.');
});

// Add delay and retry on unexpected disconnection
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('disconnected', async (reason) => {
    console.error('Client disconnected:', reason);
    console.log('Reinitializing client...');
    setTimeout(() => client.initialize(), 5000); // Retry initialization after 5 seconds
});

client.initialize();
// this one added
// Middleware to handle larger payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Define routes
app.use('/api', Routes);

app.get('/', (req, res) => {
    res.status(200).json({server:"Server is running"})
  });  


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
  