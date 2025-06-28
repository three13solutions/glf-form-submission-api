import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import submitRoute from './routes/submit.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/submit', submitRoute);

app.get('/', (req, res) => {
  res.send('Graceful Living API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
