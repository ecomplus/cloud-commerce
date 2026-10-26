import axios from 'axios';

export default async (
  trackingCode: string,
  serviceCode: string,
  token: string,
) => {
  const { data } = await axios({
    method: 'post',
    url: 'http://api.frenet.com.br/tracking/trackinginfo',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      token,
    },
    data: {
      ShippingServiceCode: serviceCode,
      TrackingNumber: trackingCode,
    },
    timeout: 10000,
  });
  return data;
};
