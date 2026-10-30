/*
 * Products shipped in more than one box (e.g. split air conditioners: indoor
 * and outdoor units) keep each box on the product hidden metafield
 * `shipping/volumes`, as JSON:
 *   [{"kg":9.5,"cm":[90,30,25]},{"kg":23,"cm":[80,60,35]}]
 * weight in kg and [length, width, height] in cm.
 *
 * Calculate shipping items don't carry metafields, so the products are
 * fetched once per quote. Without volumes, the item goes as a single package
 * with the product weight and dimensions, as before. Never sum the boxes in
 * one package: it distorts the cubic weight.
 */

export const VOLUMES_NAMESPACE = 'shipping';

export const VOLUMES_FIELD = 'volumes';

export const parseVolumes = (hiddenMetafields) => {
  if (!Array.isArray(hiddenMetafields)) return null;
  const metafield = hiddenMetafields.find(({ namespace, field }) => {
    return namespace === VOLUMES_NAMESPACE && field === VOLUMES_FIELD;
  });
  if (!metafield?.value) return null;
  let volumes;
  try {
    volumes = JSON.parse(metafield.value);
  } catch {
    return null;
  }
  if (!Array.isArray(volumes) || !volumes.length) return null;
  const isValid = volumes.every((volume) => {
    return volume
      && Number(volume.kg) > 0
      && Array.isArray(volume.cm)
      && volume.cm.length === 3
      && volume.cm.every((n) => Number(n) > 0);
  });
  if (!isValid) return null;
  return volumes.map(({ kg, cm }) => ({
    weight: Number(kg),
    length: Number(cm[0]),
    width: Number(cm[1]),
    height: Number(cm[2]),
  }));
};

const getDimension = (side, item) => {
  if (item.dimensions && item.dimensions[side]) {
    const { value, unit } = item.dimensions[side];
    switch (unit) {
      case 'm':
        return value * 100;
      case 'dm':
        return value * 10;
      case 'cm':
        return value;
      default:
        return 10;
    }
  }
  return 10;
};

const getWeight = ({ weight }) => {
  if (weight) {
    return (weight.unit && weight.unit === 'g')
      ? (weight.value / 1000)
      : weight.value;
  }
  return undefined;
};

/**
 * Frenet `ShippingItemArray`: one entry per volume when the product has
 * volumes, else one entry per cart item (previous behavior).
 */
export const buildShippingItems = (items, volumesByProductId = {}) => {
  const shippingItems = [];
  items.forEach((item) => {
    const { quantity, sku } = item;
    const volumes = volumesByProductId[item.product_id];
    if (volumes) {
      volumes.forEach((volume, i) => {
        shippingItems.push({
          Weight: volume.weight,
          Length: volume.length,
          Height: volume.height,
          Width: volume.width,
          Quantity: quantity,
          SKU: sku ? `${sku}-${i + 1}` : undefined,
        });
      });
      return;
    }
    shippingItems.push({
      Weight: getWeight(item),
      Length: getDimension('length', item),
      Height: getDimension('height', item),
      Width: getDimension('width', item),
      Quantity: quantity,
      SKU: sku,
    });
  });
  return shippingItems;
};
