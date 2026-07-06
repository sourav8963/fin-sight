import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'testkey12345';

test('Password Encryption Strength', async (t) => {
  await t.test('Bcrypt should hash passwords securely', async () => {
    const rawPass = 'alexrivera123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPass, salt);
    
    assert.ok(hash !== rawPass, 'Hash should not match raw password string');
    assert.ok(hash.startsWith('$2a$'), 'Bcrypt hash should start with $2a$ salt tag');
    
    const isMatch = await bcrypt.compare(rawPass, hash);
    assert.strictEqual(isMatch, true, 'Bcrypt compare should resolve true for matching hashes');
  });

  await t.test('Bcrypt should fail for wrong credentials', async () => {
    const rawPass = 'alexrivera123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPass, salt);
    
    const isMatch = await bcrypt.compare('wrongpassword', hash);
    assert.strictEqual(isMatch, false, 'Bcrypt compare should resolve false for incorrect passwords');
  });
});

test('JWT Authorization Token Signatures', async (t) => {
  await t.test('Token should sign and encode payloads correctly', () => {
    const payload = { id: 'usr-12345', role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    assert.ok(token && typeof token === 'string', 'Token should be a signed string');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.id, 'usr-12345', 'Decoded payload id should match');
    assert.strictEqual(decoded.role, 'admin', 'Decoded payload role should match');
  });

  await t.test('Verification should throw error for expired or invalid keys', () => {
    const payload = { id: 'usr-12345' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    assert.throws(() => {
      jwt.verify(token, 'wrong-secret-key');
    }, /invalid signature/, 'Verification should throw error on invalid signature');
  });
});

test('Budget Limit Enforcement Logic', (t) => {
  const evaluateBudgetLimit = (category, amount, limits, currentSpent) => {
    const limit = limits[category] || 0;
    if (limit > 0 && currentSpent + amount > limit) {
      return { warning: true, message: `Budget limit for ${category} exceeded!` };
    }
    return { warning: false };
  };

  const limits = { Food: 200, Utilities: 150 };

  const resultOk = evaluateBudgetLimit('Food', 50, limits, 100);
  assert.strictEqual(resultOk.warning, false, 'Should not exceed budget if within limits');

  const resultExceeded = evaluateBudgetLimit('Food', 120, limits, 100);
  assert.strictEqual(resultExceeded.warning, true, 'Should exceed budget if sum exceeds limit');
  assert.match(resultExceeded.message, /Food exceeded/, 'Should provide descriptive warning message');
});

test('Bill Payment Auto-Ledger Generation', (t) => {
  const payBillAndCreateTx = (bill) => {
    if (bill.status === 'paid') throw new Error('Already paid');
    const updatedBill = { ...bill, status: 'paid' };
    const transaction = {
      date: new Date().toISOString().slice(0, 10),
      amount: bill.amount,
      category: bill.category,
      type: 'expense',
      note: `Bill Paid: ${bill.name}`
    };
    return { bill: updatedBill, transaction };
  };

  const bill = { name: 'Rent', amount: 800, category: 'Rent', status: 'unpaid' };
  const res = payBillAndCreateTx(bill);

  assert.strictEqual(res.bill.status, 'paid', 'Status should be changed to paid');
  assert.strictEqual(res.transaction.amount, 800, 'Transaction amount should match bill amount');
  assert.strictEqual(res.transaction.type, 'expense', 'Transaction type should be expense');
});

