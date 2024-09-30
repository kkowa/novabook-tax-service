import { Router, Request, Response } from "express";
import { events } from "../models/database";
import { SaleEvent, TaxPaymentEvent } from "../models/types";

const router = Router();

router.post("/transactions", (req: Request, res: Response): void => {
  const event = req.body;

  // Basic validation
  if (!event.eventType || !event.date) {
    res.status(400).send("Invalid event format.");
    return;
  }

  // Handle Sale Event
  if (event.eventType === "SALES") {
    const saleEvent: SaleEvent = event;
    events.push(saleEvent);
  }
  // Handle Tax Payment Event
  else if (event.eventType === "TAX_PAYMENT") {
    const taxPaymentEvent: TaxPaymentEvent = event;
    events.push(taxPaymentEvent);
  } else {
    res.status(400).send("Unknown event type.");
    return;
  }

  // Return 202 Accepted
  res.status(202).end();
});

export default router;
