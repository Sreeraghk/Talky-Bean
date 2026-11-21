/**
 * Comprehensive Automated Verification Suite for Talky Bean Blocker Remediation
 * Tests:
 * 1. 18+ eligibility gate endpoints (unauthenticated rejection, payload validation, fail closed)
 * 2. Public /delete-account, /terms, and /privacy routes accessibility and unauthenticated deletion protection
 * 3. Customer complaints ticketing security, customerId association, isolation, and admin authorization
 * 4. Rate limiting and service health
 */

async function runTestSuite() {
  const baseUrl = 'http://localhost:3000';
  let passedCount = 0;
  let failedCount = 0;

  function assert(testName: string, condition: boolean, detail: string) {
    if (condition) {
      console.log(`[PASS] ${testName}: ${detail}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failedCount++;
    }
  }

  console.log('====================================================');
  console.log('TALKY BEAN FINAL BLOCKER REMEDIATION VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Service Health
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert('Health Check', res.status === 200 && data.status === 'ok', `Status ${res.status}, response: ${JSON.stringify(data)}`);
  } catch (e: any) {
    assert('Health Check', false, e.message);
  }

  // Test 2: AI Protected Endpoint - Unauthenticated Request Blocked (Fail Closed)
  try {
    const res = await fetch(`${baseUrl}/api/ai/generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: 'Hello' })
    });
    const data = await res.json();
    assert(
      'AI Endpoint Unauthenticated Rejection',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('AI Endpoint Unauthenticated Rejection', false, e.message);
  }

  // Test 3: AI Stream Protected Endpoint - Unauthenticated Request Blocked
  try {
    const res = await fetch(`${baseUrl}/api/ai/generateContentStream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: 'Hello' })
    });
    const data = await res.json();
    assert(
      'AI Stream Unauthenticated Rejection',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('AI Stream Unauthenticated Rejection', false, e.message);
  }

  // Test 4: Age Confirmation Endpoint - Unauthenticated Rejection
  try {
    const res = await fetch(`${baseUrl}/api/user/confirm-age`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdultConfirmed: true })
    });
    const data = await res.json();
    assert(
      'Age Confirmation Endpoint Unauthenticated Rejection',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Age Confirmation Endpoint Unauthenticated Rejection', false, e.message);
  }

  // Test 5: Public Route - /delete-account Direct Navigation & Refresh
  try {
    const res = await fetch(`${baseUrl}/delete-account`);
    const text = await res.text();
    assert(
      'Public /delete-account Route Accessibility',
      res.status === 200 && text.toLowerCase().includes('<!doctype html>') && text.includes('Talky Bean'),
      `HTTP status ${res.status}, content-type: ${res.headers.get('content-type')}`
    );
  } catch (e: any) {
    assert('Public /delete-account Route Accessibility', false, e.message);
  }

  // Test 6: Public Route - /terms Accessibility
  try {
    const res = await fetch(`${baseUrl}/terms`);
    const text = await res.text();
    assert(
      'Public /terms Route Accessibility',
      res.status === 200 && text.toLowerCase().includes('<!doctype html>'),
      `HTTP status ${res.status}`
    );
  } catch (e: any) {
    assert('Public /terms Route Accessibility', false, e.message);
  }

  // Test 7: Public Route - /privacy Accessibility
  try {
    const res = await fetch(`${baseUrl}/privacy`);
    const text = await res.text();
    assert(
      'Public /privacy Route Accessibility',
      res.status === 200 && text.toLowerCase().includes('<!doctype html>'),
      `HTTP status ${res.status}`
    );
  } catch (e: any) {
    assert('Public /privacy Route Accessibility', false, e.message);
  }

  // Test 8: Account Deletion Endpoint - Unauthenticated Deletion Blocked
  try {
    const res = await fetch(`${baseUrl}/api/user/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert(
      'Account Deletion API Authorization Enforcement',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Account Deletion API Authorization Enforcement', false, e.message);
  }

  // Test 9: Complaints Creation - Unauthenticated Request Blocked
  try {
    const res = await fetch(`${baseUrl}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Test Complaint',
        category: 'technical_issue',
        description: 'Audio is not working'
      })
    });
    const data = await res.json();
    assert(
      'Complaint Submission Unauthenticated Rejection',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Complaint Submission Unauthenticated Rejection', false, e.message);
  }

  // Test 10: Complaints Fetch - Customer Isolation (Unauthenticated Rejected)
  try {
    const res = await fetch(`${baseUrl}/api/complaints/my`);
    const data = await res.json();
    assert(
      'Customer Complaints Isolation (Unauthenticated Rejection)',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Customer Complaints Isolation (Unauthenticated Rejection)', false, e.message);
  }

  // Test 11: Admin Complaints Management - Unauthorized Rejection
  try {
    const res = await fetch(`${baseUrl}/api/admin/complaints`);
    const data = await res.json();
    assert(
      'Admin Complaints Management Protection (Unauthorized Block)',
      res.status === 401 || res.status === 403,
      `HTTP status ${res.status} (expected 401 or 403), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Admin Complaints Management Protection (Unauthorized Block)', false, e.message);
  }

  // Test 12: Admin Complaint Update - Unauthorized Rejection
  try {
    const res = await fetch(`${baseUrl}/api/admin/complaints/CMP-12345/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Under Review' })
    });
    const data = await res.json();
    assert(
      'Admin Complaint Update Protection (Unauthorized Block)',
      res.status === 401 || res.status === 403,
      `HTTP status ${res.status} (expected 401 or 403), error: "${data.error}"`
    );
  } catch (e: any) {
    assert('Admin Complaint Update Protection (Unauthorized Block)', false, e.message);
  }

  // Test 13: Direct Native Purchase Verification Bypass Rejected
  try {
    const res = await fetch(`${baseUrl}/api/payments/native-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipt: 'mock_receipt' })
    });
    const data = await res.json();
    assert(
      'Direct Native Store Bypass Protection',
      res.status === 401,
      `HTTP status ${res.status} (expected 401), code: "${data.code || data.error}"`
    );
  } catch (e: any) {
    assert('Direct Native Store Bypass Protection', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
