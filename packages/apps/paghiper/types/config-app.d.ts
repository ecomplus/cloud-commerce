type DiscountConfig = {
  apply_at?: 'total' | 'subtotal' | 'freight'
  min_amount?: integer,
  type?: 'percentage' | 'fixed'
  value: number
}

export type PagHiperApp = {
  paghiper_api_key?: string,
  paghiper_token?: string
  label?: string,
  text?: string,
  icon?: string,
  discount?: DiscountConfig
  cumulative_discount?: boolean
  min_amount?: integer,
  banking_billet_options?: {
    days_due_date?: integer
    fixed_description?: boolean,
    late_payment_fine?: integer,
    per_day_interest?: boolean
    early_payment_discounts_cents?: integer,
    early_payment_discounts_days?: integer,
    open_after_day_due?: integer,
  },
  pix?: {
    enable?: boolean,
    disable_billet?: boolean,
    label?: string,
    text?: string,
    icon?: string,
    discount?: DiscountConfig,
  },
}


