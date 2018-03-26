const fs = require('fs');
const Crawler = require('crawler');
const path = require('path');

const crawlerConf = require('../utils/crawler');

const crawler = new Crawler(crawlerConf);

const urlRoot = 'https://primenow.amazon.fr/browse?ie=UTF8&node=3635788031';

crawler.queue({
  uri: urlRoot,
  callback: (err, res, done) => {
    try {
      fs.writeFileSync(path.join(__dirname, 'categoryRoot.html'), res.body, 'utf8');
    }
    catch (e) {
      console.log('Error in the category root', e);
    }
    done();
  }
});

crawler.on('drain', () => {
  console.log('Finish to write the categoryRoot.html');
  process.exit();
});
