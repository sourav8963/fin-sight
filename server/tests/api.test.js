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
