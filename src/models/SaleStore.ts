export type SaleItem = {
  itemId: string;
  cost: number;
  taxRate: number;
  date: string;
};

export class SaleStore {
  // Map of invoiceId to items
  private sales: Map<string, Map<string, SaleItem>> = new Map();

  public addSale(invoiceId: string, items: SaleItem[]) {
    if (!this.sales.has(invoiceId)) {
      this.sales.set(invoiceId, new Map());
    }
    const invoice = this.sales.get(invoiceId)!;
    items.forEach((item) => {
      invoice.set(item.itemId, item);
    });
  }

  public amendSale(invoiceId: string, item: SaleItem) {
    if (!this.sales.has(invoiceId)) {
      this.sales.set(invoiceId, new Map());
    }
    const invoice = this.sales.get(invoiceId)!;
    invoice.set(item.itemId, item);
  }

  public getSalesUpTo(date: Date): SaleItem[] {
    const salesUpToDate: SaleItem[] = [];
    this.sales.forEach((invoice) => {
      invoice.forEach((item) => {
        if (new Date(item.date) <= date) {
          salesUpToDate.push(item);
        }
      });
    });
    return salesUpToDate;
  }

  public getAllSales(): SaleItem[] {
    const allSales: SaleItem[] = [];
    this.sales.forEach((invoice) => {
      invoice.forEach((item) => {
        allSales.push(item);
      });
    });
    return allSales;
  }
}
