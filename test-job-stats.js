#!/usr/bin/env node

/**
 * Test script to verify job queue statistics update correctly
 * Run: node test-job-stats.js
 */

const http = require('http');

const API_KEY = 'key_test_abc123';
const API_SECRET = 'secret_test_xyz789';
const API_URL = 'http://localhost:8000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-Api-Key': API_KEY,
        'X-Api-Secret': API_SECRET,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testJobStats() {
  console.log('🧪 Testing Job Queue Statistics Update\n');

  try {
    // Step 1: Check initial status
    console.log('📊 Step 1: Check initial job queue status');
    let stats = await makeRequest('GET', '/api/v1/test/jobs/status');
    console.log('Initial stats:', stats);
    console.log('');

    // Step 2: Create an order
    console.log('📋 Step 2: Creating order...');
    const orderRes = await makeRequest('POST', '/api/v1/orders', {
      amount: 50000,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now()
    });
    const orderId = orderRes.id;
    console.log('Order created:', orderId);
    console.log('');

    // Step 3: Create a payment (this should enqueue a job)
    console.log('💳 Step 3: Creating payment (this enqueues a job)...');
    const paymentRes = await makeRequest('POST', '/api/v1/payments', {
      order_id: orderId,
      method: 'upi',
      vpa: 'user@paytm'
    });
    const paymentId = paymentRes.id;
    console.log('Payment created:', paymentId);
    console.log('Payment status:', paymentRes.status);
    console.log('');

    // Step 4: Check job queue immediately
    console.log('📊 Step 4: Check job queue immediately after payment creation');
    stats = await makeRequest('GET', '/api/v1/test/jobs/status');
    console.log('Job queue stats:');
    console.log(`  Pending: ${stats.pending}`);
    console.log(`  Processing: ${stats.processing}`);
    console.log(`  Completed: ${stats.completed}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log('Breakdown:', stats.breakdown);
    console.log('');

    // Step 5: Wait for processing
    console.log('⏳ Step 5: Waiting 12 seconds for payment processing...');
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 1000));
      process.stdout.write('.');
    }
    console.log('\n');

    // Step 6: Check job queue after processing
    console.log('📊 Step 6: Check job queue after processing');
    stats = await makeRequest('GET', '/api/v1/test/jobs/status');
    console.log('Job queue stats:');
    console.log(`  Pending: ${stats.pending}`);
    console.log(`  Processing: ${stats.processing}`);
    console.log(`  Completed: ${stats.completed}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log('Breakdown:', stats.breakdown);
    console.log('');

    // Step 7: Check payment status
    console.log('💳 Step 7: Check final payment status');
    const finalPayment = await makeRequest('GET', `/api/v1/payments/${paymentId}`);
    console.log('Final payment status:', finalPayment.status);
    console.log('');

    // Step 8: Summary
    console.log('✅ Summary:');
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Payment Status: ${finalPayment.status}`);
    console.log(`   Completed Jobs: ${stats.completed}`);
    console.log('');
    
    if (stats.completed > 0) {
      console.log('✅ SUCCESS! Job statistics are being updated correctly!');
    } else {
      console.log('⚠️  WARNING: No completed jobs shown. Check worker logs.');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testJobStats();
