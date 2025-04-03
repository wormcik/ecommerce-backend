import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import router from './routes.js'; 
import bodyParser from 'body-parser';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/api', router);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
