import { Router, Request, Response } from 'express';
import { eventStore } from '../models/index';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /tax-position:
 *   get:
 *     summary: Retrieve tax position for a given date
 *     tags: [Tax Position]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date to query the tax position for
 *     responses:
 *       200:
 *         description: Successful response with tax position
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                 taxPosition:
 *                   type: number
 *       400:
 *         description: Missing or invalid date parameter
 *       500:
 *         description: Internal Server Error
 */

router.get('/', (req: Request, res: Response) => {
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Missing or invalid date parameter' });
    return;
  }

  try {
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    // Get all events up to the query date
    const eventsUpToDate = eventStore.getEventsUpTo(queryDate);

    let totalTaxFromSales = 0;
    let totalTaxPayments = 0;

    eventsUpToDate.forEach((event) => {
      if (event.eventType === 'SALES') {
        const saleEvent = event;
        saleEvent.items.forEach((item) => {
          totalTaxFromSales += item.cost * item.taxRate;
        });
      } else if (event.eventType === 'TAX_PAYMENT') {
        const taxPayment = event;
        totalTaxPayments += taxPayment.amount;
      }
    });

    // Convert totalTaxFromSales from pennies to pennies (since tax is calculated on pennies)
    // So, assuming tax position is also in pennies
    const taxPosition = totalTaxFromSales - totalTaxPayments;

    res.status(200).json({
      date: date,
      taxPosition: Math.round(taxPosition), // Ensure it's an integer
    });
  } catch (error) {
    logger.error(`Error querying tax position: ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
