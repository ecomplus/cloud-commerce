# `@cloudcommerce/app-custom-shipping`

## Shipping rules

Each item of `shipping_rules` (app data) may combine:

| Field | Effect |
|---|---|
| `zip_range.min` / `zip_range.max` | Destination ZIP range |
| `min_amount` | Minimum cart subtotal for the rule to apply |
| `total_price` | Fixed price (or the service `total_price` when unset) |
| `amount_tax` | Percentage of the cart subtotal added to the price |
| `excedent_weight_cost` + `max_cubic_weight` | Price per kg above the weight limit |
| `min_price` | Floor for the final price, e.g. "3% of the cart, at least R$ 150" |

When two valid rules share the same `service_code`, the cheapest wins, so a
floor can't be emulated with a second rule: use `min_price`.

Admin settings schema for `min_price` (add to `shipping_rules.schema.items.properties`
on the Market app):

```json
"min_price": {
  "type": "number",
  "minimum": 0,
  "maximum": 99999999,
  "title": "Valor mínimo do frete",
  "description": "Piso do frete calculado (ex.: X% do carrinho, com mínimo de R$ Y)"
}
```

Unit tests: `pnpm build && bash scripts/tests-unit.sh`.
