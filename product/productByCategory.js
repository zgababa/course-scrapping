const Crawler = require('crawler');
const crawlerConf = require('../utils/crawler');

function scrapProductsByCategory(categoryUrl) {
  let crawler;

  return new Promise((resolve) => {
    const products = [];

    function getProduct(err, res, done) {
      const $ = res.$;
      $('#house-search-result .asin-card .asin__main__offer').each((index, product) => {
        products
          .push({
            imageUrl: $(product).find('img').attr('src'),
            url: `https://primenow.amazon.fr${$(product).find('a').attr('href')}`,
            title: $(product).find('p.asin__details__title').text().trim()
          });
      });

      const nextPageUrl = $('#house-search-pagination .a-last a').attr('href');
      if (nextPageUrl) {
        console.log('CRAWL next page');
        crawler.queue(`https://primenow.amazon.fr${nextPageUrl}`);
      }
      console.log('done');
      done();
    }

    crawler = new Crawler(Object.assign({}, crawlerConf, { callback: getProduct }));

    crawler.queue(categoryUrl);
    crawler.on('drain', () => {
      console.log('DRAIN');
      resolve(products);
    });
  });
}

module.exports = scrapProductsByCategory;
