export interface Item {
  itemId: string;
  cost: number; // amount in pennies
  taxRate: number;
}

export interface SaleEvent {
  eventType: 'SALES';
  date: string; // ISO 8601
  invoiceId: string;
  items: Item[];
}

export interface TaxPaymentEvent {
  eventType: 'TAX_PAYMENT';
  date: string; // ISO 8601
  amount: number; // amount in pennies
}

export type TransactionEvent = SaleEvent | TaxPaymentEvent;
