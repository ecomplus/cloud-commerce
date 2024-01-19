process.env.STOREFRONT_BASE_DIR = './packages/storefront';

const { genTailwindConfig } = require('./packages/storefront/config/storefront.tailwind.cjs');

module.exports = genTailwindConfig();
