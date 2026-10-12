import type { Products, ResourceId } from '@cloudcommerce/api/types';
import {
  type Mock,
  describe,
  test,
  expect,
  vi,
  afterEach,
} from 'vitest';
import { nextTick } from 'vue';
import api from '@cloudcommerce/api';
import { price as getPrice } from '@ecomplus/utils';
import { useProductCard } from '@@sf/composables/use-product-card';
import { useProductDetails } from '@@sf/composables/use-product-details';
import { shoppingCart, resetCartItems } from '@@sf/state/shopping-cart';

vi.mock('@cloudcommerce/api', () => ({ default: { get: vi.fn() } }));
// Tracking events are out of scope here (and require a browser window)
vi.mock('@@sf/state/use-analytics', async (importOriginal) => ({
  ...await importOriginal<Record<string, unknown>>(),
  emitGtagEvent: vi.fn(),
}));

const apiGet = api.get as unknown as Mock;
const id = (char: string) => char.repeat(24) as ResourceId;
const kitId = id('a');
const shirtId = id('b');
const socksId = id('c');
const sizeP = id('d');
const sizeM = id('e');

// Kit items as listed by the API with `kitItemFields`, R$150 as standalone
const kitItems = [{
  _id: shirtId,
  sku: 'SHIRT',
  name: 'Camisa',
  available: true,
  price: 80,
  quantity: 8,
  variations: [
    { _id: sizeP, name: 'P', quantity: 3 },
    { _id: sizeM, name: 'M', quantity: 5 },
  ],
}, {
  _id: socksId,
  sku: 'SOCKS',
  name: 'Meia',
  available: true,
  price: 35,
  quantity: 4,
}];

// R$100 kit of 1 shirt (size picked by the buyer, unless fixed) + 2 socks
const getKitProduct = (shirtVariationId?: ResourceId) => ({
  _id: kitId,
  sku: 'KIT',
  name: 'Kit camisa e meias',
  available: true,
  visible: true,
  price: 100,
  quantity: 50,
  kit_composition: [{
    _id: shirtId,
    quantity: 1,
    has_variations: true,
    variation_id: shirtVariationId,
  }, {
    _id: socksId,
    quantity: 2,
    has_variations: false,
  }],
} as Products);

const mockApi = ({ freshKitQuantity = 50 } = {}) => {
  apiGet.mockImplementation(async (_endpoint, { params, fields }) => {
    // Kit items are listed with SKU, the kit product fresh stock without
    const result = fields.includes('sku')
      ? kitItems.filter(({ _id }) => params._id.includes(_id))
      : [{ _id: kitId, price: 100, quantity: freshKitQuantity }];
    return { data: { result } };
  });
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Kit product card', () => {
  test('limits kit stock to the packs its least available item can fill', async () => {
    mockApi();
    const { product, loadKitItems } = useProductCard({
      product: getKitProduct(),
      isSkipStockRefetch: true,
    });
    await loadKitItems();
    // The best shirt size fills 5 packs, the 4 socks only 2 packs
    expect(product.quantity).toBe(2);
  });

  test('keeps the kit stock limit after refreshing the kit product stock', async () => {
    vi.useFakeTimers();
    vi.stubEnv('SSR', false);
    mockApi({ freshKitQuantity: 50 });
    const { product, loadKitItems } = useProductCard({
      product: { ...getKitProduct(), __ssr: true },
    });
    await loadKitItems();
    expect(product.quantity).toBe(2);
    // Hydrated products stocks are refreshed (debounced) on browser
    await vi.advanceTimersByTimeAsync(1500);
    expect(apiGet).toHaveBeenCalledTimes(2);
    expect(product.quantity).toBe(2);
  });

  test('requires SKU pick only for kit items with variations not fixed', () => {
    const isKitSkuRequired = (product: Products) => {
      return useProductCard({ product, isSkipStockRefetch: true }).isKitSkuRequired.value;
    };
    expect(isKitSkuRequired(getKitProduct())).toBe(true);
    expect(isKitSkuRequired(getKitProduct(sizeM))).toBe(false);
    expect(isKitSkuRequired({ ...getKitProduct(), kit_composition: undefined })).toBe(false);
  });

  test('adds a kit to cart only with sizes picked, charging the kit price', async () => {
    mockApi();
    resetCartItems();
    const { loadToCart, isFailedToCart } = useProductCard({
      product: getKitProduct(),
      isSkipStockRefetch: true,
    });
    expect(await loadToCart(1)).toEqual([null]);
    expect(isFailedToCart.value).toBe(true);
    const cartItems = await loadToCart(2, { kitVariationIds: [sizeM] });
    expect(cartItems).toMatchObject([
      { product_id: shirtId, variation_id: sizeM, quantity: 2 },
      { product_id: socksId, quantity: 4 },
    ]);
    // `pack_quantity` counts the units of a single kit pack, not of all packs
    cartItems.forEach((item) => expect(item?.kit_product?.pack_quantity).toBe(3));
    await nextTick();
    expect(shoppingCart.subtotal).toBeCloseTo(200);
  });
});

describe('Kit product details shipping', () => {
  const setup = () => {
    // No component instance here, `onMounted` hooks are skipped with warnings
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    return useProductDetails({ product: getKitProduct(), canUseUrlParams: false });
  };

  test('ships kit items priced by the kit, not by standalone prices', async () => {
    mockApi();
    const {
      shippedItems,
      quantity,
      addToCart,
      selectKitVariation,
    } = setup();
    quantity.value = 2;
    // Loads kit items (on mount usually), nothing is added without size picked
    expect(await addToCart()).toBe(null);
    selectKitVariation(0, sizeM);
    await nextTick();
    expect(shippedItems).toMatchObject([
      { _id: shirtId, variation_id: sizeM, quantity: 2 },
      { _id: socksId, quantity: 4 },
    ]);
    // Subtotal as summed by the shipping calculator (for free shipping rules)
    const subtotal = shippedItems.reduce((sum, item) => {
      return sum + getPrice(item) * item.quantity;
    }, 0);
    expect(subtotal).toBeCloseTo(200);
  });

  test('keeps shipping the kit product itself when kit items fail to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    apiGet.mockRejectedValue(new Error('Network error'));
    const { shippedItems, quantity, addToCart } = setup();
    await addToCart();
    quantity.value = 3;
    await nextTick();
    expect(shippedItems).toMatchObject([{ _id: kitId, quantity: 3 }]);
  });
});
