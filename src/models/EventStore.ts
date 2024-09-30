export type SaleEvent = {
  eventType: 'SALES';
  date: string;
  invoiceId: string;
  items: {
    itemId: string;
    cost: number;
    taxRate: number;
  }[];
};

export type TaxPaymentEvent = {
  eventType: 'TAX_PAYMENT';
  date: string;
  amount: number;
};

export type SalesAmendmentEvent = {
  eventType: 'SALES_AMENDMENT';
  date: string;
  invoiceId: string;
  itemId: string;
  cost: number;
  taxRate: number;
};

export type TransactionEvent =
  | SaleEvent
  | TaxPaymentEvent
  | SalesAmendmentEvent;

export class EventStore {
  private events: TransactionEvent[] = [];

  public addEvent(event: TransactionEvent) {
    this.events.push(event);
    // Keep events sorted by date for efficient querying
    this.events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  public getEventsUpTo(date: Date): TransactionEvent[] {
    return this.events.filter((event) => new Date(event.date) <= date);
  }

  public getAllEvents(): TransactionEvent[] {
    return this.events;
  }
}
