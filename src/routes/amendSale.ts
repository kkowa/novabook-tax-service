import { Router, Request, Response } from 'express';
import { eventStore, saleStore } from '../models/index';
import { logger } from '../utils/logger';

export const router = Router();

/**
 * @swagger
 * /sale:
 *   patch:
 *     summary: Amend an existing sale
 *     tags: [Sale]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the amendment
 *               invoiceId:
 *                 type: string
 *                 description: The ID of the invoice to amend
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to amend
 *               cost:
 *                 type: number
 *                 description: The new cost of the item
 *               taxRate:
 *                 type: number
 *                 description: The new tax rate of the item
 *     responses:
 *       202:
 *         description: Sale successfully amended
 *       400:
 *         description: Invalid amendment structure
 *       500:
 *         description: Internal Server Error
 */
router.patch('/', (req: Request, res: Response) => {
  const { date, invoiceId, itemId, cost, taxRate } = req.body;

  // Validation
  if (
    !date ||
    !invoiceId ||
    !itemId ||
    typeof cost !== 'number' ||
    typeof taxRate !== 'number'
  ) {
    res.status(400).json({ error: 'Invalid amendment structure' });
    return;
  }

  try {
    const amendmentDate = new Date(date);
    if (isNaN(amendmentDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    // Amend in SaleStore
    saleStore.amendSale(invoiceId, {
      itemId,
      cost,
      taxRate,
      date,
    });

    // Also, add an amendment event to EventStore for observability
    const amendmentEvent = {
      eventType: 'SALES_AMENDMENT',
      date,
      invoiceId,
      itemId,
      cost,
      taxRate,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventStore.addEvent(amendmentEvent as any); // Type casting since EventStore expects TransactionEvent

    logger.info(`Amended sale: ${JSON.stringify(amendmentEvent)}`);
    res.status(202).send();
  } catch (error) {
    logger.error(`Error amending sale: ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
