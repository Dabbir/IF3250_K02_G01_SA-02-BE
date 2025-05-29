console.log('Starting debug script');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Debug server running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
});