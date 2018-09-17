const express = require('express');
const categoryJson = require('./category/category.json');
const productByCategory = require('./product/productByCategory.js');

const app = express();

app.get('/categories', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(categoryJson));
});

app.get('/category/:title', async (req, res) => {
  const products = await productByCategory(req.params.title);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(products));
});

app.listen(3005, () => {
  console.log('Example app listening on port 3005!');
});


app.get('categories', (req, res) => {
  res.send('Hello World! :)');
});
