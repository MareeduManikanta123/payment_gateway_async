const router = require("express").Router();
const pool = require("../config/db");

router.get("/merchant", async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, api_key FROM merchants WHERE email=$1",
    ["test@example.com"]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ seeded: false });
  }

  return res.json({
    ...result.rows[0],
    seeded: true
  });
});

// GET /api/v1/test/jobs/status - Job queue status (for testing)
router.get("/jobs/status", async (req, res) => {
  try {
    const { paymentQueue, webhookQueue, refundQueue } = require("../config/queue");
    
    // Get counts from each queue
    const paymentCounts = await getQueueCounts(paymentQueue);
    const webhookCounts = await getQueueCounts(webhookQueue);
    const refundCounts = await getQueueCounts(refundQueue);

    const pending = paymentCounts.waiting + webhookCounts.waiting + refundCounts.waiting;
    const processing = paymentCounts.active + webhookCounts.active + refundCounts.active;
    const completed = paymentCounts.completed + webhookCounts.completed + refundCounts.completed;
    const failed = paymentCounts.failed + webhookCounts.failed + refundCounts.failed;

    console.log(`[Job Queue Stats] Pending: ${pending}, Processing: ${processing}, Completed: ${completed}, Failed: ${failed}`);
    console.log(`  Payment: waiting=${paymentCounts.waiting}, active=${paymentCounts.active}, completed=${paymentCounts.completed}, failed=${paymentCounts.failed}`);
    console.log(`  Webhook: waiting=${webhookCounts.waiting}, active=${webhookCounts.active}, completed=${webhookCounts.completed}, failed=${webhookCounts.failed}`);
    console.log(`  Refund: waiting=${refundCounts.waiting}, active=${refundCounts.active}, completed=${refundCounts.completed}, failed=${refundCounts.failed}`);

    res.json({
      pending,
      processing,
      completed,
      failed,
      worker_status: "running",
      breakdown: {
        payment: paymentCounts,
        webhook: webhookCounts,
        refund: refundCounts
      }
    });
  } catch (err) {
    console.error("Error getting job queue status:", err);
    res.json({
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      worker_status: "unknown"
    });
  }
});

async function getQueueCounts(queue) {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount()
    ]);

    return { waiting, active, completed, failed };
  } catch (error) {
    console.error(`Error getting counts for queue ${queue.name}:`, error);
    return { waiting: 0, active: 0, completed: 0, failed: 0 };
  }
}

module.exports = router;
