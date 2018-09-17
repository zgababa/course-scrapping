// Exrait dans les pages stockée en bdd les produits

const mongoClient = require('../utils/mongoClient');
const cheerio = require('cheerio');

async function scrapProductsByCategory(categoryTitle) {
  const db = await mongoClient.getDb();
  const pages = await db.collection(categoryTitle).find({}).toArray();
  const products = [];

  function getProducts(page) {
    const $ = cheerio.load(page.body);
    // Check this selector if nothing is returned, and test with node directly to have the console output
    $('[class^=product_grid__grid__] li').each((index, product) => {
      products
        .push({
          imageUrl: 'N/A',
          url: `https://primenow.amazon.fr${$(product).find('a').attr('href')}`,
          title: $(product).find('[class^=text_truncate__root__]').text().trim(),
          price: $(product).find('[class^=asin_price__priceFull__]').text().trim()
            .split(' €')[0],
          pricePerKilo: $(product).find('[class^=asin_price__pricePerUnit__]').text().trim()
            .split(' €')[0].split('(')[1] || null
        });
    });
  }

  return Promise
    .all(pages.map(getProducts))
    .then(() => products);
}

module.exports = scrapProductsByCategory;
// scrapProductsByCategory('Eaux plates'); // Only for test
