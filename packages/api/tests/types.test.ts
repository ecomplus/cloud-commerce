import callApi from '../src/index';

callApi({
  storeId: 1056,
  method: 'get',
  endpoint: 'products/618041aa239b7206d3fc06de',
}).then(({ data }) => {
  if (data.sku === '123') {
    console.log('123');
  } else {
    console.log(data._id);
  }
});
