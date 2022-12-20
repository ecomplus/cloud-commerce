
export type GalaxpayApp = {
  galaxpay_id: string,
  galaxpay_hash: string,
  galaxpay_sandbox?: boolean,
  galaxpay_public_token?: string,
  credit_card?: {
    disable?: boolean,
    label?: string,
    min_amount: number,
    text?: string,
    icon?: string,
  }
  banking_billet?: {
    disable?: boolean,
    label?: string,
    min_amount: number,
    text?: string,
    icon?: string,
    add_days: integer,
  };
  pix?: {
    disable?: boolean,
    label?: string,
    min_amount: number,
    instructions?: string,
    add_days: integer
  };
  plans?: {
    label: string,
    periodicity: 'Semanal' | 'Quinzenal' | 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual'
    quantity: integer | 0,
    discount: {
      percentage: boolean,
      value: number,
      apply_at: 'total' | 'subtotal' | 'frete',
      min_amount?: number
    }
  }[];
}

export type GalaxPaySubscriptions = {
  myId: string,
  value: integer,
  quantity: integer,
  periodicity: string,
  firstPayDayDate: string,
  additionalInfo?: string,
  mainPaymentMethodId: string,
  Customer: {
    myId?: string,
    name: string,
    document: string,
    emails: string[],
    phones?: integer[],
    Address?: {
      zipCode: number,
      street: string,
      number: string,
      complement?: string,
      neighborhood: string,
      city: string,
      state: string
    }
  },
  Transactions?: {
    myId: string,
    installment: integer,
    value?: integer,
    payday?: string,
    payedOutsideGalaxPay?: boolean,
    additionalInfo?: string,
  }[],
  PaymentMethodCreditCard?: {
    Card?: {
      hash?: string,
    },
    preAuthorize: boolean
  },
  PaymentMethodBoleto?: {
    fine?: integer,
    interest?: integer,
    instructions?: string,
    deadlineDays?: integer
  },
  PaymentMethodPix?: {
    fine?: integer,
    interest?: integer,
    instructions?: string,
    Deadline?: {
      type?: string,
      value?: integer
    }
  }
  ExtraFields?: {
    tagName: string
    tagValue: string
  }[]
}
