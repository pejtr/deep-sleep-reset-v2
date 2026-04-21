import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.log('No STRIPE_SECRET_KEY in environment');
  process.exit(1);
}
console.log('Key prefix:', key.substring(0, 12));
const stripe = new Stripe(key);

try {
  const coupon = await stripe.coupons.retrieve('TEST999');
  console.log('Coupon found:', JSON.stringify(coupon, null, 2));
} catch (e) {
  console.error('Coupon error:', e.message, e.code);
  
  // Try to list all coupons
  try {
    const coupons = await stripe.coupons.list({ limit: 10 });
    console.log('All coupons:', coupons.data.map(c => ({ id: c.id, name: c.name, valid: c.valid })));
  } catch (e2) {
    console.error('List error:', e2.message);
  }
}
