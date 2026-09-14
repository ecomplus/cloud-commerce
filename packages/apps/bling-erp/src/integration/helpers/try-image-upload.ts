import axios from 'axios';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import getEnv from '@cloudcommerce/firebase/lib/env';
import { imageSize } from 'image-size';

const tryImageSize = (data: any) => {
  try {
    return imageSize(Buffer.from(data));
  } catch {
    return null;
  }
};

let ecomAccessToken: string | undefined;
let tokenFetchedAt = 0;
// Reautentica preventivamente: o token module-scoped sobrevive em instância
// quente além da validade e todo upload passava a cair no fallback com 401
const TOKEN_TTL_MS = 1000 * 60 * 30;

const getEcomAccessToken = async () => {
  const { apiAuth: { authenticationId, apiKey } } = getEnv();
  if (!ecomAccessToken || Date.now() - tokenFetchedAt > TOKEN_TTL_MS) {
    const { data } = await api.post('authenticate', {
      _id: authenticationId,
      api_key: apiKey,
    });
    ecomAccessToken = data.access_token;
    tokenFetchedAt = Date.now();
  }
  return ecomAccessToken;
};

const tryImageUpload = async (
  originImgUrl: string,
  productName: string,
) => {
  const {
    storeId,
    apiAuth: {
      authenticationId,
    },
  } = getEnv();
  try {
    const { data } = await axios.get(originImgUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
    });
    const dimensions = tryImageSize(data);
    const formData = new FormData();
    let filename = originImgUrl.replace(/.*\/([^/]+)$/, '$1').replace(/\?.*$/, '');
    if (!/\.[a-z]+$/i.test(filename)) {
      filename += '.jpg';
    }
    formData.append('file', new Blob([data]), filename);
    const postUpload = async () => {
      return axios.post('https://ecomplus.app/api/storage/upload.json', formData, {
        headers: {
          'X-Store-ID': storeId,
          'X-My-ID': authenticationId,
          'X-Access-Token': await getEcomAccessToken(),
        },
        timeout: 60000,
      });
    };
    let uploadResponse: Awaited<ReturnType<typeof postUpload>>;
    try {
      uploadResponse = await postUpload();
    } catch (err: any) {
      if (err.response?.status !== 401) throw err;
      // Token invalidado antes do TTL: reautentica e tenta o upload uma vez
      ecomAccessToken = undefined;
      uploadResponse = await postUpload();
    }
    const { data: { picture }, status } = uploadResponse;
    if (picture) {
      const w = dimensions?.width;
      const h = dimensions?.height;
      if (w && h && picture.zoom) {
        picture.zoom.size = `${w}x${h}`;
      }
      Object.keys(picture).forEach((imgSize) => {
        if (!picture[imgSize]) return;
        if (!picture[imgSize].url) {
          delete picture[imgSize];
          return;
        }
        const maxPx = picture[imgSize].size;
        if (w && h && maxPx > 0) {
          if (maxPx >= Math.max(w, h)) {
            picture[imgSize].size = `${w}x${h}`;
          } else {
            picture[imgSize].size = w > h
              ? `${maxPx}x${Math.round((h * maxPx) / w)}`
              : `${Math.round((w * maxPx) / h)}x${maxPx}`;
          }
        } else if (picture[imgSize].size !== undefined) {
          delete picture[imgSize].size;
        }
        picture[imgSize].alt = `${productName} (${imgSize})`;
      });
      if (Object.keys(picture).length) {
        return {
          _id: ecomUtils.randomObjectId(),
          normal: picture.zoom,
          ...picture,
        };
      }
    }
    const err: any = new Error('Unexpected Storage API response');
    err.response = { data, status };
    throw err;
  } catch (err: any) {
    logger.warn(`Failed uploading ${originImgUrl}`, {
      message: err.message,
    });
    return {
      _id: ecomUtils.randomObjectId(),
      normal: {
        url: originImgUrl,
        alt: productName,
      },
    };
  }
};

export default tryImageUpload;
