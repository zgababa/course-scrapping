'use strict';

const cheerio = require('cheerio');
const fs = require('fs');
const TreeModel = require('tree-model');
const Crawler = require('crawler');
const path = require('path');

const crawlerConf = require('../utils/crawler');

const crawler = new Crawler(crawlerConf);

const tree = new TreeModel();
const fileName = fs.readFileSync(path.join(__dirname, 'categoryRoot.html'));

function scrapCategories() {
  return new Promise((resolve) => {
    function addChildToNode(toto, $1) {
      $1('#house-search-department-filter ul li')
        .each((index, value) => {
          const title = $1(value).find('span').text().trim();
          const url = `https://primenow.amazon.fr${decodeURIComponent($1(value).find('input').val())}`;
          if (index) {
            const node = tree.parse({ title, url });
            toto.addChild(node);
          }
        });
      return toto;
    }

    function buildTree(root, $) {
      const node = addChildToNode(root, $);
      node.walk((d) => {
        if (!d.isRoot() && d.model.title !== node.model.title) {
          crawler.queue({
            uri: d.model.url,
            callback: (err, res, done) => {
              buildTree(d, res.$);
              done();
            }
          });
        }
      });
    }

    const rootPage = cheerio.load(fileName);
    const topCategoryTitle = rootPage('#house-search-department-filter #house-search-department-filter-subtitle')
      .text().trim();
    const topRoot = tree.parse({
      title: topCategoryTitle, url: 'https://primenow.amazon.fr/search?rh=n:3635788031,p_95:U00E'
    });

    buildTree(topRoot, rootPage);
    crawler.on('drain', () => {
      // Retour à l'api
      return resolve(JSON.stringify(topRoot.model, null, 2));
    });
  });
}

module.exports = scrapCategories;
