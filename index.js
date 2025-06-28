const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// Routes
const submitRoute = require('./routes/submit');
app.use('/api/submit', submitRoute);

// Health check
app.get('/', (req, res) => {
  res.send('Graceful Living API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
