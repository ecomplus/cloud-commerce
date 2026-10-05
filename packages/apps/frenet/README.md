# `@cloudcommerce/app-frenet`

## Products with more than one volume

Products shipped in more than one box (e.g. split air conditioners, indoor and
outdoor units) can list each box on the product hidden metafield
`shipping/volumes`, as JSON with weight in kg and `[length, width, height]`
in cm:

```json
[{"kg":9.5,"cm":[90,30,25]},{"kg":23,"cm":[80,60,35]}]
```

The quote then sends one package per volume (times the item quantity) instead
of one package with the product weight and dimensions. Products without the
metafield keep the previous behavior. Boxes are never summed into a single
package, which would distort the cubic weight.

Unit tests: `node --test tests-unit/`.
