import { Router, Request, Response } from 'express';
import {
  TransactionEvent,
  SaleEvent,
  TaxPaymentEvent,
} from '../models/EventStore.js';
import { eventStore, saleStore } from '../models/index.js';
import { logger } from '../utils/logger.js';

const router = Router();
/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Ingest a transaction event
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     cost:
 *                       type: number
 *                     taxRate:
 *                       type: number
 *     responses:
 *       202:
 *         description: Event successfully ingested
 *       400:
 *         description: Invalid event structure
 *       500:
 *         description: Internal Server Error
 */

router.post('/', (req: Request, res: Response) => {
  const event: TransactionEvent = req.body;

  // Basic Validation
  if (!event.eventType || !event.date) {
    res.status(400).json({ error: 'Invalid event structure' });
    return;
  }

  const eventDate = new Date(event.date);
  if (isNaN(eventDate.getTime())) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }

  try {
    if (event.eventType === 'SALES') {
      const saleEvent = event as SaleEvent;
      if (!saleEvent.invoiceId || !Array.isArray(saleEvent.items)) {
        res.status(400).json({ error: 'Invalid SALES event structure' });
        return;
      }

      // Store in SaleStore for amendments
      saleStore.addSale(
        saleEvent.invoiceId,
        saleEvent.items.map((item) => ({
          ...item,
          date: saleEvent.date,
        }))
      );
    } else if (event.eventType === 'TAX_PAYMENT') {
      const taxPaymentEvent = event as TaxPaymentEvent;
      if (typeof taxPaymentEvent.amount !== 'number') {
        res.status(400).json({ error: 'Invalid TAX_PAYMENT event structure' });
        return;
      }
    } else {
      res.status(400).json({ error: 'Unknown eventType' });
      return;
    }

    // Add to EventStore
    eventStore.addEvent(event);
    logger.info(`Ingested event: ${JSON.stringify(event)}`);
    res.status(202).send();
  } catch (error) {
    logger.error(`Error ingesting event: ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
