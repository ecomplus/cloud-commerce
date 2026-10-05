/*
 * 3DS rules, isolated from the authentication script so the MPI can be
 * replaced (Cielo will retire MPI V2 for V3) without touching authorization:
 * on both versions the authorization receives the same Cavv, Xid, Eci,
 * Version and ReferenceId.
 */

/**
 * ECI values of authenticated (or attempted) transactions with liability
 * shift, from Cielo docs: Visa, Elo and Amex 05/06, Mastercard 02/01. The
 * union is safe: Visa never returns 01/02 and Mastercard never 05/06.
 */
export const AUTHENTICATED_ECI = ['01', '02', '05', '06'];

export const REFUSAL_MESSAGE = 'O banco não autenticou esta compra no cartão (3DS). '
  + 'Tente novamente ou pague com Pix ou boleto.';

/**
 * Status set by the browser script (`status3ds` on the card hash).
 */
const STATUS_LABELS = {
  authenticated: 'autenticado',
  failure: 'desafio não concluído',
  unenrolled: 'cartão não elegível',
  disabled: 'autenticação desabilitada',
  error: 'erro na autenticação',
  unsupported_brand: 'bandeira sem 3DS',
  timeout: 'tempo esgotado',
  script_error: 'script do 3DS não carregou',
  not_performed: 'não realizado',
};

export const get3dsOptions = (appData) => {
  const options = appData?.braspag_3ds || {};
  const isRequired = Boolean(options.required);
  let timeout = Number(options.timeout);
  if (!timeout || Number.isNaN(timeout)) {
    // A challenge may require opening the bank app or typing an SMS code
    timeout = isRequired ? 300 : 30;
  }
  return {
    hasCredentials: Boolean(options.client_id && options.client_secret),
    isRequired,
    timeoutMs: Math.min(Math.max(timeout, 30), 900) * 1000,
    hasFraudAnalysis: Boolean(options.fraud_analysis),
  };
};

export const parse3dsResult = (out3ds, status3ds) => {
  if (!out3ds || typeof out3ds !== 'object') {
    return {
      isAuthenticated: false,
      status: status3ds && STATUS_LABELS[status3ds] ? status3ds : 'not_performed',
    };
  }
  const eci = out3ds.Eci !== undefined && out3ds.Eci !== null
    ? String(out3ds.Eci).padStart(2, '0')
    : '';
  const isAuthenticated = Boolean(
    out3ds.Cavv
    && out3ds.ReferenceId
    && AUTHENTICATED_ECI.includes(eci),
  );
  return {
    isAuthenticated,
    status: isAuthenticated ? 'authenticated' : (status3ds || 'error'),
    eci,
    version: out3ds.Version ? String(out3ds.Version) : '',
    referenceId: out3ds.ReferenceId ? String(out3ds.ReferenceId) : '',
  };
};

/**
 * Only the fields Cielo expects on `Payment.ExternalAuthentication`: the hash
 * comes from the browser and must not inject anything else in the request.
 */
export const toExternalAuthentication = (out3ds) => {
  const externalAuthentication = {};
  ['Cavv', 'Xid', 'Eci', 'Version', 'ReferenceId'].forEach((field) => {
    if (out3ds[field] !== undefined && out3ds[field] !== null && out3ds[field] !== '') {
      externalAuthentication[field] = String(out3ds[field]);
    }
  });
  return externalAuthentication;
};

/**
 * Transaction custom fields shown on the order (admin), so the merchant no
 * longer checks 3DS by hand.
 */
export const to3dsCustomFields = (result) => {
  const fields = [{
    field: '3ds',
    value: result.isAuthenticated
      ? 'autenticado'
      : `não autenticado (${STATUS_LABELS[result.status] || result.status})`,
  }];
  if (result.eci) fields.push({ field: '3ds_eci', value: result.eci });
  if (result.version) fields.push({ field: '3ds_versao', value: result.version });
  if (result.referenceId) fields.push({ field: '3ds_referencia', value: result.referenceId });
  return fields;
};

export class Required3dsError extends Error {
  constructor(result) {
    super(REFUSAL_MESSAGE);
    this.name = 'Required3dsError';
    this.result = result;
  }
}
