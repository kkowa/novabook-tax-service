import { SaleStore, SaleItem } from '../src/models/SaleStore';

describe('SaleStore additional tests', () => {
  let saleStore: SaleStore;

  beforeEach(() => {
    saleStore = new SaleStore();
  });

  it('should amend sale even when invoice does not exist', () => {
    const saleItem: SaleItem = {
      itemId: 'item1',
      cost: 150,
      taxRate: 0.2,
      date: '2024-01-01',
    };

    saleStore.amendSale('INV001', saleItem);
    const allSales = saleStore.getAllSales();
    expect(allSales.length).toBe(1);
  });

  it('should amend sale for existing invoice and item', () => {
    const saleItem: SaleItem = {
      itemId: 'item1',
      cost: 100,
      taxRate: 0.2,
      date: '2024-01-01',
    };

    saleStore.addSale('INV001', [saleItem]);
    saleStore.amendSale('INV001', { ...saleItem, cost: 200 });

    const allSales = saleStore.getAllSales();
    expect(allSales[0].cost).toBe(200);
  });

  it('should return sales up to a specific date', () => {
    const saleItems: SaleItem[] = [
      { itemId: 'item1', cost: 100, taxRate: 0.2, date: '2024-01-01' },
      { itemId: 'item2', cost: 150, taxRate: 0.1, date: '2024-01-02' },
      { itemId: 'item3', cost: 200, taxRate: 0.15, date: '2024-01-05' }, // this one will be excluded
    ];

    saleStore.addSale('INV001', saleItems);

    const salesUpToDate = saleStore.getSalesUpTo(new Date('2024-01-03'));
    expect(salesUpToDate.length).toBe(2); // Only two items should be included
    expect(salesUpToDate).toEqual([
      { itemId: 'item1', cost: 100, taxRate: 0.2, date: '2024-01-01' },
      { itemId: 'item2', cost: 150, taxRate: 0.1, date: '2024-01-02' },
    ]);
  });

  it('should return an empty array when no sales are before the given date', () => {
    const saleItems: SaleItem[] = [
      { itemId: 'item1', cost: 100, taxRate: 0.2, date: '2024-01-05' },
    ];

    saleStore.addSale('INV001', saleItems);

    const salesUpToDate = saleStore.getSalesUpTo(new Date('2024-01-01'));
    expect(salesUpToDate.length).toBe(0); // No sales should be included
    expect(salesUpToDate).toEqual([]);
  });
});
