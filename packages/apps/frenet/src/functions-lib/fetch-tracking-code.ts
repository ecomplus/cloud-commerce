import axios from 'axios';

export default (
  trackingCode: string,
  serviceCode: string,
  token: string,
) => new Promise((resolve) => {
  axios({
    method: 'post',
    url: 'http://api.frenet.com.br/tracking/trackinginfo',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      token,
    },
    data: {
      ShippingServiceCode: serviceCode,
      TrackingNumber: trackingCode,
    },
  })
    .then(({ data }) => resolve(data));
});
