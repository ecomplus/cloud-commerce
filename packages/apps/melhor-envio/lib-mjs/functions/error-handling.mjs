import logger from 'firebase-functions/logger';

const ignoreError = (response) => {
  // check response status code
  // should ignore some error responses
  const { status, data } = response;
  if (status >= 400 && status < 500) {
    switch (status) {
      case 403:
        // ignore resource limits errors
        return true;

      case 404:
        if (data && data.error_code !== 20) {
          // resource ID not found ?
          // ignore
          return true;
        }
        break;
      default:
        return false;
    }
  }
  // must debug
  return false;
};

export default (err) => {
  // axios error object
  // https://github.com/axios/axios#handling-errors
  if (!err.appAuthRemoved && !err.appErrorLog) {
    // error not treated by App SDK
    if (err.response) {
      if (ignoreError(err.response)) {
        // ignore client error
        return;
      }
      err.responseJSON = JSON.stringify(err.response.data);
    }

    // debug unexpected response
    logger.error('>>(App Melhor Envio) =>', err);
  } else if (err.appErrorLog && !err.appErrorLogged) {
    // cannot log to app hidden data
    // debug app log error
    const error = err.appErrorLog;
    const { response, config } = error;

    // handle error response
    if (response) {
      if (ignoreError(response)) {
        return;
      }
      // debug unexpected response
      error.configJSON = {
        originalRequest: JSON.stringify(err.config),
        logRequest: JSON.stringify(config),
      };
      logger.error('>>(App Melhor Envio) => ', error);
    }
  }
};
