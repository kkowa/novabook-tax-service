import request from "supertest";
import app from "../src/main";
import { events } from "../src/models/database";

describe("Transaction Routes", () => {
  beforeEach(() => {
    // Clear the events array before each test
    events.length = 0;
  });

  describe("POST /transactions", () => {
    it("should accept a valid sale event and return 202", async () => {
      const saleEvent = {
        eventType: "SALES",
        date: "2024-02-22T17:29:39Z",
        invoiceId: "3419027d-960f-4e8f-b8b7-f7b2b4791824",
        items: [
          {
            itemId: "02db47b6-fe68-4005-a827-24c6e962f3df",
            cost: 1099,
            taxRate: 0.2,
          },
        ],
      };

      const response = await request(app).post("/transactions").send(saleEvent);

      expect(response.status).toBe(202);
    });

    it("should accept a valid tax payment event and return 202", async () => {
      const taxPaymentEvent = {
        eventType: "TAX_PAYMENT",
        date: "2024-02-22T17:29:39Z",
        amount: 74901,
      };

      const response = await request(app)
        .post("/transactions")
        .send(taxPaymentEvent);

      expect(response.status).toBe(202);
    });

    it("should return 400 for invalid eventType", async () => {
      const invalidEvent = {
        eventType: "INVALID_TYPE",
        date: "2024-02-22T17:29:39Z",
      };

      const response = await request(app)
        .post("/transactions")
        .send(invalidEvent);

      expect(response.status).toBe(400);
      expect(response.text).toBe("Unknown event type.");
    });

    it("should return 400 for missing eventType", async () => {
      const invalidEvent = {
        date: "2024-02-22T17:29:39Z",
      };

      const response = await request(app)
        .post("/transactions")
        .send(invalidEvent);

      expect(response.status).toBe(400);
      expect(response.text).toBe("Invalid event format.");
    });

    it("should return 400 for missing date", async () => {
      const invalidEvent = {
        eventType: "SALES",
        invoiceId: "3419027d-960f-4e8f-b8b7-f7b2b4791824",
        items: [],
      };

      const response = await request(app)
        .post("/transactions")
        .send(invalidEvent);

      expect(response.status).toBe(400);
      expect(response.text).toBe("Invalid event format.");
    });

    // Add more test cases as needed
  });
});
