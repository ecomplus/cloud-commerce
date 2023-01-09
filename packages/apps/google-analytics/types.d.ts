type EventItem = {
  item_id: string,
  item_name: string,
  coupon?: string,
  affiliation?: string,
  currency?: string,
  creative_name?: string,
  creative_slot?: string,
  discount?: number,
  index?: number,
  item_brand?: string,
  item_category?: string,
  item_category2?: string,
  item_category3?: string,
  item_category4?: string,
  item_category5?: string,
  item_list_id?: string,
  item_list_name?: string,
  item_variant?: string,
  location_id?: string,
  price?: number,
  promotion_id?: string,
  promotion_name?: string,
  quantity?: number,
}

type EventParams = {
  id: string,
  currency: string,
  transaction_id: string,
  value: number,
  status?: string,
  affiliation?: string,
  coupon?: string,
  shipping?: number,
  tax?: number,
  items: EventItem[],
}

export {
  EventItem,
  EventParams,
};
