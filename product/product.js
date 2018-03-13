'use strict';

const Crawler = require('crawler');

const categories = require('../category/category.json');
// const productProxy = require('../../proxy/productProxy.js');
// const categoryProxy = require('../../proxy/categoryProxy.js');   REMPLACER PAR APPEL À L'API
const crawlerConf = require('../utils/crawler');

let crawler;

function getProductsUrl() {
  return categories.children
    .map(category => (category.children ? category.children : category))
    .reduce((a, b) => a.concat(b), [])
    .map((a => a.url));
}

const productUrls = getProductsUrl();


function saveProduct(err, res, done) {
  const $ = res.$;
  let categoryTitle = $('#house-search-department-filter-subtitle')
    .contents().last().text()
    .trim()
    .replace(/\n/g, '')
    .split('>')[1];

  if (!categoryTitle) {
    console.log('No category found !');
    return;
  }
  categoryTitle = categoryTitle.trim();

  console.log('GET PRODUCT OF', categoryTitle);

  const promises = [];
  $('#house-search-result .asin-card .asin__main__offer').each((index, product) => {
    promises
      .push(
        categoryProxy
          .getCategoryByTitle(categoryTitle)
          .then((category) => {
            return productProxy.createProduct({
              categoryId: category.id,
              imageUrl: $(product).find('img').attr('src'),
              url: `https://primenow.amazon.fr${$(product).find('a').attr('href')}`,
              title: $(product).find('p.asin__details__title').text().trim()
            });
          })
      );
  });


  Promise.all(promises).then(() => {
    const nextPageUrl = $('#house-search-pagination .a-last a').attr('href');
    if (nextPageUrl) {
      console.log('CRAWL next page');
      crawler.queue(`https://primenow.amazon.fr${nextPageUrl}`);
    }
    console.log('done');
    done();
  });
}

crawler = new Crawler(Object.assign({}, crawlerConf, { callback: saveProduct }));

crawler.queue(productUrls);
crawler.on('drain', () => {
  console.log('DRAIN');
  process.exit();
});
