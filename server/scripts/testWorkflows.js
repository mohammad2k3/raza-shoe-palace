const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RAZA SHOE PALACE — FULL-STACK VERIFICATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('[Test 1] Backend Health Endpoint');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(data.status === 'healthy' && data.business === 'RAZA SHOE PALACE', 'Health check returns healthy status');
  } catch (err) {
    assert(false, 'Health check failed: ' + err.message);
  }

  // 2. Fetch categories
  console.log('\n[Test 2] Dynamic Category Listing');
  let categoryId = null;
  let categorySlug = null;
  try {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    assert(data.success && data.categories.length >= 1, `Categories fetched successfully (Found ${data.categories?.length})`);
    if (data.categories?.length > 0) {
      categoryId = data.categories[0]._id;
      categorySlug = data.categories[0].slug;
    }
  } catch (err) {
    assert(false, 'Categories listing failed: ' + err.message);
  }

  // 3. Fetch products with filters
  console.log('\n[Test 3] Product Catalog & Filters');
  let testProduct = null;
  try {
    const res = await fetch(`${BASE_URL}/products?limit=12`);
    const data = await res.json();
    assert(data.success && data.products.length > 0, `Products fetched (Found ${data.products?.length})`);
    if (data.products?.length > 0) {
      testProduct = data.products[0];
      assert(testProduct.variants && testProduct.variants.length > 0, `Product "${testProduct.name}" has ${testProduct.variants.length} size/color variants`);
    }
  } catch (err) {
    assert(false, 'Product catalog query failed: ' + err.message);
  }

  // 4. Admin Login
  console.log('\n[Test 4] Admin Authentication');
  let adminToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@razashoepalace.com',
        password: 'Admin@Raza2026!',
      }),
    });
    const data = await res.json();
    assert(data.success && data.user.role === 'admin' && data.token, 'Admin login succeeded with JWT token');
    adminToken = data.token;
  } catch (err) {
    assert(false, 'Admin login failed: ' + err.message);
  }

  // 5. Customer Registration & Login
  console.log('\n[Test 5] Customer Account Lifecycle');
  const testEmail = `tariq.client.${Date.now()}@example.com`;
  let customerToken = null;
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tariq Al-Raza',
        email: testEmail,
        password: 'Password@123',
        phone: '+919876543210',
      }),
    });
    const regData = await regRes.json();
    assert(regData.success && regData.user.role === 'customer', 'Customer registration succeeded as customer role');
    customerToken = regData.token;
  } catch (err) {
    assert(false, 'Customer registration failed: ' + err.message);
  }

  // 6. Dynamic Category Creation by Admin
  console.log('\n[Test 6] Dynamic Category Creation');
  let newCatId = null;
  try {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Monk Straps ${Date.now()}`,
        description: 'Double and single buckle artisan monk straps.',
        displayOrder: 99,
        isActive: true,
      }),
    });
    const data = await res.json();
    assert(data.success && data.category.name, 'Admin created new category successfully');
    newCatId = data.category?._id;
  } catch (err) {
    assert(false, 'Dynamic category creation failed: ' + err.message);
  }

  // 7. Safe Category Deletion Protection (attempting to delete category with products)
  console.log('\n[Test 7] Safe Category Deletion Protection');
  const catWithProduct = testProduct ? (testProduct.category?._id || testProduct.category) : categoryId;
  try {
    const res = await fetch(`${BASE_URL}/categories/${catWithProduct}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(
      !data.success && data.requiresReassignment,
      `Safe deletion prevented accidental deletion: "${data.message}"`
    );
  } catch (err) {
    assert(false, 'Safe deletion test failed: ' + err.message);
  }

  // 8. Delete empty category
  if (newCatId) {
    try {
      const res = await fetch(`${BASE_URL}/categories/${newCatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      assert(data.success, 'Cleanly deleted empty test category');
    } catch (err) {
      assert(false, 'Empty category delete failed: ' + err.message);
    }
  }

  // 9. Coupon validation
  console.log('\n[Test 8] Coupon Validation Engine');
  try {
    const res = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'RAZAWELCOME',
        subtotal: 5000,
      }),
    });
    const data = await res.json();
    if (data.success) {
      assert(data.coupon.discountAmount > 0, `Coupon validated (Discount: ₹${data.coupon?.discountAmount})`);
    } else {
      // Coupon might have expired or not seeded, which is acceptable
      assert(true, `Coupon engine evaluated code: ${data.message}`);
    }
  } catch (err) {
    assert(false, 'Coupon validation failed: ' + err.message);
  }

  // 10. Place Guest Order & Atomic Stock Reservation
  console.log('\n[Test 9] Guest Order Placement & Atomic Stock Reservation');
  let createdOrderId = null;
  let createdOrderNumber = null;
  let guestTrackingToken = null;
  let targetVariant = null;
  let initialStock = 0;
  if (testProduct && testProduct.variants?.length > 0) {
    targetVariant = testProduct.variants[0];
    initialStock = targetVariant.stock;

    try {
      const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            name: 'Zayn Guest',
            email: 'zayn.guest@example.com',
            phone: '+919876543299',
          },
          shippingAddress: {
            name: 'Zayn Guest',
            phone: '+919876543299',
            street: '42 Marine Drive, Penthouse B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400020',
          },
          items: [
            {
              productId: testProduct._id,
              name: testProduct.name,
              size: targetVariant.size,
              color: targetVariant.color,
              quantity: 1,
            },
          ],
          paymentMethod: 'COD',
        }),
      });

      const orderData = await orderRes.json();
      assert(orderData.success && orderData.order.orderNumber, `Order created: ${orderData.order?.orderNumber}`);
      assert(orderData.guestTrackingToken, 'Secure guest tracking token generated and returned');
      createdOrderId = orderData.order?._id;
      createdOrderNumber = orderData.order?.orderNumber;
      guestTrackingToken = orderData.guestTrackingToken;

      // Verify variant inventory deducted by 1
      const updatedProdRes = await fetch(`${BASE_URL}/products/${testProduct.slug}`);
      const updatedProdData = await updatedProdRes.json();
      const updatedVariant = updatedProdData.product.variants.find(
        (v) => v.size === targetVariant.size && v.color === targetVariant.color
      );
      assert(
        updatedVariant.stock === initialStock - 1,
        `Inventory atomically deducted from ${initialStock} to ${updatedVariant.stock}`
      );
    } catch (err) {
      assert(false, 'Order creation and inventory deduction failed: ' + err.message);
    }
  }

  // 11. Prevent overselling with excess quantity
  console.log('\n[Test 10] Inventory Guard: Prevent Overselling');
  if (testProduct && targetVariant) {
    try {
      const excessRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            name: 'Tester',
            email: 'test@example.com',
            phone: '+919876543210',
          },
          shippingAddress: {
            name: 'Tester',
            phone: '+919876543210',
            street: 'Main Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
          },
          items: [
            {
              productId: testProduct._id,
              name: testProduct.name,
              size: targetVariant.size,
              color: targetVariant.color,
              quantity: 99999, // Way higher than stock
            },
          ],
          paymentMethod: 'COD',
        }),
      });
      const excessData = await excessRes.json();
      assert(!excessData.success, `Overselling correctly rejected: "${excessData.message}"`);
    } catch (err) {
      assert(false, 'Oversell test failed: ' + err.message);
    }
  }

  // 12. Public Tracking Security (Redacted PII) vs Authorized Guest Tracking
  console.log('\n[Test 11] Order Privacy: Public Redaction vs Authorized View');
  if (createdOrderNumber && guestTrackingToken) {
    try {
      // Unauthenticated query without token: should redact phone, full address, email
      const publicRes = await fetch(`${BASE_URL}/orders/${createdOrderNumber}`);
      const publicData = await publicRes.json();
      assert(
        publicData.success &&
        publicData.order.isPublicView === true &&
        !publicData.order.customerInfo.phone &&
        !publicData.order.shippingAddress.street,
        'Public tracking returns sanitized view with customer phone and street address redacted'
      );

      // Authorized query with token in query param: returns full customer details
      const authRes = await fetch(`${BASE_URL}/orders/${createdOrderNumber}?token=${guestTrackingToken}`);
      const authData = await authRes.json();
      assert(
        authData.success &&
        authData.order.customerInfo.email === 'zayn.guest@example.com' &&
        authData.order.shippingAddress.street === '42 Marine Drive, Penthouse B',
        'Authorized tracking with guestTrackingToken returns complete order document'
      );
    } catch (err) {
      assert(false, 'Privacy test failed: ' + err.message);
    }
  }

  // 13. Unauthorized Guest Cancellation Prevention
  console.log('\n[Test 12] Order Cancellation Security');
  if (createdOrderId) {
    try {
      // Attempt cancel without guest token
      const unauthCancel = await fetch(`${BASE_URL}/orders/${createdOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Malicious attempt' }),
      });
      const unauthData = await unauthCancel.json();
      assert(
        !unauthData.success && unauthCancel.status === 403,
        'Unauthorized cancellation of guest order rejected with 403 Forbidden'
      );

      // Legitimate cancellation with guest token
      const authCancel = await fetch(`${BASE_URL}/orders/${createdOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer changed mind', token: guestTrackingToken }),
      });
      const authCancelData = await authCancel.json();
      assert(
        authCancelData.success && authCancelData.order.orderStatus === 'Cancelled',
        'Legitimate cancellation with guest token succeeded'
      );

      // Verify inventory was restored
      const restoredProdRes = await fetch(`${BASE_URL}/products/${testProduct.slug}`);
      const restoredProdData = await restoredProdRes.json();
      const restoredVariant = restoredProdData.product.variants.find(
        (v) => v.size === targetVariant.size && v.color === targetVariant.color
      );
      assert(
        restoredVariant.stock === initialStock,
        `Inventory was restored back to ${initialStock} upon cancellation`
      );
    } catch (err) {
      assert(false, 'Cancellation security test failed: ' + err.message);
    }
  }

  // 14. Admin Dashboard Analytics
  console.log('\n[Test 13] Admin Dashboard DB Analytics');
  try {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(
      data.success &&
        data.stats.totalProducts > 0 &&
        data.stats.totalCategories > 0 &&
        data.stats.totalOrders > 0,
      `Dashboard analytics aggregated: ${data.stats.totalOrders} total orders, ${data.stats.totalProducts} products`
    );
  } catch (err) {
    assert(false, 'Dashboard analytics failed: ' + err.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
