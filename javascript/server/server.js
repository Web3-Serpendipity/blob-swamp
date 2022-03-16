const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('../client/main.js', {root: __dirname});
  res.send('../client/index.html', {root: __dirname});
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));