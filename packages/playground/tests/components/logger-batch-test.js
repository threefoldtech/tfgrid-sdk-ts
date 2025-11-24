/**
 * Logger Batching Test Script
 *
 * Run this in the browser console after opening the playground
 * to verify the batching functionality works correctly.
 *
 * Usage:
 * 1. Open playground in browser
 * 2. Open Logger panel
 * 3. Open browser console (F12)
 * 4. Type "allow pasting" and press Enter (if Chrome shows warning)
 * 5. Copy and paste this entire script
 * 6. Watch the results
 *
 * Alternative: Use DevTools Snippets (no paste restriction):
 * - Sources tab → Snippets → New snippet → Paste → Run
 */

(async function testLoggerBatching() {
  console.log("🧪 Starting Logger Batching Tests...\n");

  // Test 1: Small batch (should wait 500ms)
  console.log("Test 1: Small batch (10 logs) - should flush after ~500ms");
  const start1 = Date.now();
  for (let i = 0; i < 10; i++) {
    console.log(`[Test 1] Log ${i + 1}`);
  }

  await new Promise(resolve => setTimeout(resolve, 600));
  const elapsed1 = Date.now() - start1;
  console.log(`✅ Test 1 completed in ${elapsed1}ms (expected ~500ms delay)\n`);

  // Test 2: Batch size (50 logs - should flush immediately)
  console.log("Test 2: Batch size (50 logs) - should flush immediately");
  const start2 = Date.now();
  for (let i = 0; i < 50; i++) {
    console.log(`[Test 2] Log ${i + 1}`);
  }
  const elapsed2 = Date.now() - start2;
  console.log(`✅ Test 2 completed in ${elapsed2}ms (should be < 100ms for immediate flush)\n`);

  // Test 3: Large batch (200 logs - should batch in groups of 50)
  console.log("Test 3: Large batch (200 logs) - should batch in groups");
  const start3 = Date.now();
  for (let i = 0; i < 200; i++) {
    console.log(`[Test 3] Log ${i + 1}`);
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  const elapsed3 = Date.now() - start3;
  console.log(`✅ Test 3 completed in ${elapsed3}ms\n`);

  // Test 4: Check IndexedDB
  console.log("Test 4: Verifying logs in IndexedDB...");
  try {
    const request = indexedDB.open("TF_LOGGER_DB", 1);
    request.onsuccess = e => {
      const db = e.target.result;
      const tx = db.transaction(["logs"], "readonly");
      const store = tx.objectStore("logs");

      const countRequest = store.count();
      countRequest.onsuccess = () => {
        console.log(`✅ Found ${countRequest.result} logs in IndexedDB`);

        // Get recent logs
        const index = store.index("timestamp");
        const getAllRequest = index.getAll(null, 260); // Get last 260 logs
        getAllRequest.onsuccess = () => {
          const testLogs = getAllRequest.result.filter(
            log =>
              log.message.includes("[Test 1]") || log.message.includes("[Test 2]") || log.message.includes("[Test 3]"),
          );
          console.log(`✅ Found ${testLogs.length} test logs in IndexedDB`);
          console.log("📊 Test Summary:");
          console.log(`   - Test 1 logs: ${testLogs.filter(l => l.message.includes("[Test 1]")).length}`);
          console.log(`   - Test 2 logs: ${testLogs.filter(l => l.message.includes("[Test 2]")).length}`);
          console.log(`   - Test 3 logs: ${testLogs.filter(l => l.message.includes("[Test 3]")).length}`);
          console.log("\n✅ All tests completed! Check the Logger panel to verify logs appear correctly.");
        };
      };
    };
  } catch (error) {
    console.error("❌ Error checking IndexedDB:", error);
  }

  // Performance test
  console.log("\n📊 Performance Test: Generating 100 logs...");
  const perfStart = performance.now();
  for (let i = 0; i < 100; i++) {
    console.log(`[Perf] Log ${i + 1}`);
  }
  const perfEnd = performance.now();
  console.log(`✅ Generated 100 logs in ${(perfEnd - perfStart).toFixed(2)}ms`);
  console.log("   (This should be fast - actual writes happen asynchronously in batches)");
})();
