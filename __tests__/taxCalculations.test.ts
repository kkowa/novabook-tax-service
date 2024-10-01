import { SaleItem } from '../src/models/SaleStore';
import { server } from '../src/index'; // Adjust import based on your app structure

describe('Tax Calculations', () => {
  it('should calculate tax on an item', () => {
    const item: SaleItem = {
      itemId: 'item1',
      cost: 100,
      taxRate: 0.2,
      date: '2024-01-01',
    };
    const tax = item.cost * item.taxRate;
    expect(tax).toBe(20);
  });

  it('should calculate tax position', () => {
    const sales = [
      { cost: 100, taxRate: 0.2 },
      { cost: 50, taxRate: 0.1 },
    ];
    const taxPosition = sales.reduce(
      (totalTax, sale) => totalTax + sale.cost * sale.taxRate,
      0
    );
    expect(taxPosition).toBe(25);
  });

  afterAll((done) => {
    server.close(done);
  });
});
