/* eslint-disable no-console */
import './fetch-polyfill';
import callApi from '../src/index';

callApi({
  storeId: 1056,
  method: 'get',
  endpoint: 'products/618041aa239b7206d3fc06de',
}).then(({ data }) => {
  if (data.sku === 'string') {
    console.log('\\o/');
  }
  console.info(`✓ Read product ${data.sku} and checked SKU type string`);
});
