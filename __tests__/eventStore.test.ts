import {
  EventStore,
  SaleEvent,
  TaxPaymentEvent,
} from '../src/models/EventStore';

describe('EventStore additional tests', () => {
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = new EventStore();
  });

  it('should return events up to a specific date', () => {
    const saleEvent: SaleEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };
    eventStore.addEvent(saleEvent);

    const events = eventStore.getEventsUpTo(new Date('2024-01-02'));
    expect(events.length).toBe(1);
  });

  it('should handle empty event store for querying events up to a date', () => {
    const events = eventStore.getEventsUpTo(new Date('2024-01-01'));
    expect(events.length).toBe(0);
  });

  it('should return an empty array when no events exist before the specified date', () => {
    const events = eventStore.getEventsUpTo(new Date('2025-01-01'));
    expect(events).toEqual([]);
  });

  it('should return all events', () => {
    const saleEvent: SaleEvent = {
      eventType: 'SALES',
      date: '2024-01-01',
      invoiceId: 'INV001',
      items: [{ itemId: 'item1', cost: 100, taxRate: 0.2 }],
    };

    const taxPaymentEvent: TaxPaymentEvent = {
      eventType: 'TAX_PAYMENT',
      date: '2024-01-02',
      amount: 500,
    };

    eventStore.addEvent(saleEvent);
    eventStore.addEvent(taxPaymentEvent);

    const events = eventStore.getAllEvents();
    expect(events.length).toBe(2); // Two events were added
    expect(events[0]).toEqual(saleEvent);
    expect(events[1]).toEqual(taxPaymentEvent);
  });

  it('should return an empty array when no events have been added', () => {
    const events = eventStore.getAllEvents();
    expect(events.length).toBe(0); // No events in the store
  });
});
