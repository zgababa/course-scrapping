'use strict';

const cheerio = require('cheerio');
const fs = require('fs');

const filesName = fs.readdirSync('../orderPage');
const weighted = require('weighted');

function extractOrder($) {
  const order = {
    date: $('#browser-order-status-order-date').text().trim().split('Date de commande :')[1],
    commandNumber: $('#browser-order-status-order-number').text().trim().split('N° de commande : ')[1],
    products: []
  };

  $('#order-status-main-container .a-box-inner .pn-order-status-item-detail-url')
    .each((index, value) => {
      const product = {};
      product.link = `https://primenow.amazon.fr${$(value).attr('href')}`;
      product.img = $(value).find('img').attr('src');
      product.quantity = parseInt(
        $(value).find('.a-size-base-plus.a-color-base.a-text-caps.a-nowrap')
          .text()
          .trim()
          .split('\n')[0]
          .split('Qté : ')[1]
        , 10);

      product.shortName = $(value).find('.a-column.a-span10 .a-size-base-plus.a-color-base').text().trim();
      product.reference = product.link.split('/').pop().split('?')[0];

      order.products.push(product);
    });

  return order;
}

const ordersFromFile = filesName.reduce((memo, fileName) => {
  const page = fs.readFileSync(`../orderPage/${fileName}`, 'utf-8');
  const pageLoaded = cheerio.load(page);
  return memo.concat(extractOrder(pageLoaded));
}, []);

function getMostOrderedProduct(orders) {
  const orderTime = orders.length;

  return Object
    .values(
      orders
        .map(order => order.products)
        .reduce((a, b) => a.concat(b), [])
        .reduce((memo, order) => {
          if (memo[order.reference]) {
            memo[order.reference].recurence += 1;
            memo[order.reference].quantity += order.quantity;
            memo[order.reference].frequency = ((memo[order.reference].recurence / orderTime) * 100).toFixed();
          }
          else {
            memo[order.reference] = {
              name: order.shortName,
              img: order.img,
              recurence: 1,
              quantity: order.quantity,
              frequency: ((1 / orderTime) * 100).toFixed()
            };
          }
          return memo;
        }, {})
    )
    .sort((a, b) => b.frequency - a.frequency);
}

const orderedProducts = getMostOrderedProduct(ordersFromFile);

const items = orderedProducts.reduce((memo, value) => {
  memo[value.name] = value.frequency / 100;
  return memo;
}, {});

const cart = [...Array(10)].map(() => {
  const name = weighted.select(items, { normal: false });
  delete items[name];
  return name;
});
console.log('Votre liste de courses : \n', cart);

fs.writeFileSync('orders.json', JSON.stringify(orderedProducts), 'utf-8');
