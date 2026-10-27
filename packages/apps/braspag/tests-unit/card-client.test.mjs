import assert from 'node:assert';
import fs from 'node:fs';
import test, { describe } from 'node:test';
import vm from 'node:vm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { minify } from 'uglify-js';
import { REFUSAL_MESSAGE } from '../lib-mjs/lib/braspag/3ds/policy.mjs';

const readFile = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
// Same minification as the build: the CDN serves the minified file
const cardClientScript = minify(readFile('../assets/braspag-card-client.js')).code;

const CIELO_SOP_SCRIPT = 'https://transaction.cieloecommerce.cielo.com.br/post/scripts/silentorderpost-1.0.min.js';
const BRASPAG_SOP_SCRIPT = 'https://www.pagador.com.br/post/scripts/silentorderpost-1.0.min.js';

const card = {
  name: 'FULANO DE TAL', number: '4024007197692931', cvc: '123', month: '12', year: '30', brand: 'visa',
};
const authenticated = {
  Cavv: 'AAABBBCCC=', Xid: null, Eci: '05', Version: '2.2.0', ReferenceId: 'ref-1',
};

// Just the DOM the card client touches
const createDocument = (onAppend) => {
  const createElement = (tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      id: '',
      className: '',
      value: '',
      src: '',
      style: {},
      children: [],
      parentNode: null,
      setAttribute(name, value) {
        element[name] = value;
      },
      appendChild(child) {
        child.parentNode = element;
        element.children.push(child);
        onAppend(child);
        return child;
      },
      remove() {
        if (!element.parentNode) return;
        const siblings = element.parentNode.children;
        siblings.splice(siblings.indexOf(element), 1);
        element.parentNode = null;
      },
    };
    return element;
  };
  const head = createElement('head');
  const body = createElement('body');
  const allElements = () => {
    const list = [];
    const walk = (element) => element.children.forEach((child) => {
      list.push(child);
      walk(child);
    });
    walk(head);
    walk(body);
    return list;
  };
  return {
    head,
    body,
    createElement,
    getElementById: (id) => allElements().find((element) => element.id === id) || null,
    querySelector(selector) {
      const [, srcPrefix] = selector.match(/^script\[src\^="(.+)"\]$/) || [];
      if (!srcPrefix) throw new Error(`Selector not supported by the test DOM: ${selector}`);
      return allElements().find((element) => {
        return element.tagName === 'SCRIPT' && element.src.startsWith(srcPrefix);
      }) || null;
    },
  };
};

const formValues = (form) => Object.fromEntries(form.children.map((input) => {
  return [input.className, String(input.value)];
}));

/**
 * Runs the card client as the checkout does: SOP script on the page, `window`
 * variables from the onload expression and `storefrontApp` from the checkout.
 * `sopResponse` and `mpiResult` play the Braspag SOP and Cielo MPI scripts.
 */
const loadCardClient = ({
  sopScript = BRASPAG_SOP_SCRIPT,
  vars = {},
  customer = {},
  settings = {},
  sopResponse = (options) => options.onSuccess({ PaymentToken: 'payment-token' }),
  mpiResult = (config) => config.onSuccess(authenticated),
} = {}) => {
  const sopCalls = [];
  const window = {
    console: { log() {} },
    setTimeout,
    btoa,
    fetch: async () => ({ ok: true, text: async () => '200.100.50.25' }),
    location: { origin: 'https://loja.example.com' },
    storefront: { settings },
    storefrontApp: { amount: { total: 1500 }, customer },
    _braspagAccessToken: 'sop-token-1',
    _braspagIsSandbox: false,
    ...vars,
    bpSop_silentOrderPost(options) {
      sopCalls.push(options);
      sopResponse(options, sopCalls.length);
    },
  };
  window.window = window;
  window.document = createDocument((element) => {
    if (element.tagName === 'SCRIPT' && element.src.includes('BP.Mpi')) {
      setTimeout(() => mpiResult(window.bpmpi_config()), 0);
    }
  });
  if (sopScript) {
    const script = window.document.createElement('script');
    script.src = sopScript;
    window.document.head.appendChild(script);
  }
  vm.runInNewContext(cardClientScript, window);
  // ClearSale fills it on a real page
  window.document.getElementById('mySessionId').value = 'session-id';
  const hashCard = () => window._braspagCardClient({ ...card });
  return { window, sopCalls, hashCard };
};

const required3ds = {
  _braspag3dsToken: '3ds-token',
  _braspag3dsRequired: true,
  _braspag3dsTimeout: 500,
};

describe('Card client', () => {
  test('card goes to Cielo only when the Cielo SOP script is on the page', async () => {
    const cielo = loadCardClient({ sopScript: CIELO_SOP_SCRIPT });
    await cielo.hashCard();
    assert.strictEqual(cielo.sopCalls[0].provider, 'cielo');

    const braspag = loadCardClient({ sopScript: BRASPAG_SOP_SCRIPT });
    await braspag.hashCard();
    assert.strictEqual(braspag.sopCalls[0].provider, 'braspag');
  });

  test('SOP form has the CVV on the class the SOP script reads', async () => {
    const { window, hashCard } = loadCardClient();
    await hashCard();
    const sopForm = formValues(window.document.getElementById('formBraspag'));
    assert.strictEqual(sopForm['bp-sop-cardcvv'], '123');
    assert.strictEqual(sopForm['bp-sop-cardexpirationdate'], '12/2030');
    assert.strictEqual(sopForm['bp-sop-cardnumber'], card.number);
  });

  test('3DS fields in the documented format, empty ones left out', async () => {
    const { window, hashCard } = loadCardClient({
      vars: required3ds,
      customer: {
        fullname: 'Fulano de Tal',
        main_email: 'f@example.com',
        doc_number: '123.456.789-09',
        phones: [{ country_code: 55, number: '(11) 98765-4321' }],
        addresses: [
          { street: 'Rua B', number: 1, zip: '22222-222' },
          {
            default: true,
            street: 'Rua A',
            number: 10,
            borough: 'Centro',
            city: '',
            province_code: 'SP',
            country_code: 'BR',
            zip: '01310-100',
          },
        ],
        orders: [{ _id: 'order-1' }],
      },
    });
    const hash = JSON.parse(Buffer.from(await hashCard(), 'base64').toString());
    assert.strictEqual(hash.token, 'payment-token');
    assert.strictEqual(hash.status3ds, 'authenticated');

    const fields = formValues(window.document.getElementById('braspag3ds'));
    assert.strictEqual(fields.bpmpi_billto_phonenumber, '5511987654321');
    assert.strictEqual(fields.bpmpi_billto_zipcode, '01310100');
    assert.strictEqual(fields.bpmpi_billto_customerid, '12345678909');
    assert.strictEqual(fields.bpmpi_billto_street1, 'Rua A, 10');
    assert.strictEqual(fields.bpmpi_billto_street2, 'Centro');
    assert.strictEqual(fields.bpmpi_merchant_url, 'https://loja.example.com');
    assert.strictEqual(fields.bpmpi_merchant_newcustomer, 'false');
    assert.strictEqual(fields.bpmpi_device_ipaddress, '200.100.50.25');
    assert.ok(!('bpmpi_billto_city' in fields), 'empty city left out');
    assert.ok(!Object.keys(fields).some((key) => key.startsWith('bpmpi_device_1_')));
    assert.ok(!Object.values(fields).includes(''), 'no empty field');
  });

  test('3DS fields out of format are left out, not sent', async () => {
    const { window, hashCard } = loadCardClient({
      vars: required3ds,
      settings: { domain: 'www.loja.com.br' },
      customer: {
        fullname: 'Fulano de Tal',
        doc_number: '123456789012',
        phones: [{ number: '98765-4321' }],
        addresses: [{ street: 'Rua A', zip: '1310-100' }],
        orders: [],
      },
    });
    await hashCard();
    const fields = formValues(window.document.getElementById('braspag3ds'));
    assert.ok(!('bpmpi_billto_phonenumber' in fields), 'phone without area code');
    assert.ok(!('bpmpi_billto_customerid' in fields), 'neither CPF nor CNPJ');
    assert.ok(!('bpmpi_billto_zipcode' in fields), 'zip code without 8 digits');
    assert.strictEqual(fields.bpmpi_merchant_url, 'https://www.loja.com.br');
    assert.strictEqual(fields.bpmpi_merchant_newcustomer, 'true');
  });

  test('a spent SOP token is never sent again', async () => {
    const { sopCalls, hashCard } = loadCardClient();
    await hashCard();
    await assert.rejects(hashCard(), (err) => /Recarregue a página/.test(err.userMsg));
    assert.strictEqual(sopCalls.length, 1);
  });

  test('a SOP API error spends the token too', async () => {
    const { sopCalls, hashCard } = loadCardClient({
      sopResponse: (options) => options.onError({ Code: 0, Text: '' }),
    });
    await assert.rejects(hashCard(), (err) => /Recarregue a página/.test(err.userMsg));
    await assert.rejects(hashCard(), /already used/);
    assert.strictEqual(sopCalls.length, 1);
  });

  test('card refused by the SOP script before sending keeps the token', async () => {
    const { sopCalls, hashCard } = loadCardClient({
      sopResponse: (options, call) => (call === 1
        ? options.onInvalid([{ Field: 'bp-sop-cardnumber' }])
        : options.onSuccess({ PaymentToken: 'payment-token' })),
    });
    await assert.rejects(hashCard());
    assert.ok(await hashCard());
    assert.strictEqual(sopCalls.length, 2);
  });

  test('required 3DS not authenticated: same refusal message as the server', async () => {
    const { hashCard } = loadCardClient({
      vars: required3ds,
      mpiResult: (config) => config.onFailure({ Eci: '07' }),
    });
    await assert.rejects(hashCard(), (err) => {
      return err.message === REFUSAL_MESSAGE && err.userMsg === ` ${REFUSAL_MESSAGE}`;
    });
  });
});
