'use strict';

// Stock les pages de produits html d'Amazon dans mongodb

const Crawler = require('crawler');
const categories = require('../category/category.json');
const crawlerConf = require('../utils/crawler');
const _ = require('lodash');
const { connectToServer } = require('../utils/mongoClient');

let crawler;

function getProductsUrl() {
  return categories.children
    .map(category => (category.children ? category.children : category))
    .reduce((a, b) => a.concat(b), [])
    .map((a => a.url));
}


(async function iife() {
  const db = await connectToServer();
  const productUrls = getProductsUrl();

  async function saveProduct(err, res, done) {
    const $ = res.$;
    const currentUrl = res.request.uri.href;
    const currentCategory = _.find(categories.children, { url: currentUrl });

    if (!currentCategory) {
      return done();
    }

    const categoryTitle = currentCategory.title;

    await db.collection(categoryTitle).insertOne({
      body: res.body,
      url: res.request.uri.href
    });

    const nextPageUrl = $('#house-search-pagination .a-last a').attr('href');
    if (nextPageUrl) {
      console.log('CRAWL next page');
      return crawler.queue(`https://primenow.amazon.fr${nextPageUrl}`);
    }
    console.log('done');
    return done();
  }

  crawler = new Crawler(Object.assign({}, crawlerConf, { callback: saveProduct, timeout: 60000 }));

  crawler.queue(productUrls);
  crawler.on('drain', () => {
    console.log('DRAIN');
    process.exit();
  });
}());
