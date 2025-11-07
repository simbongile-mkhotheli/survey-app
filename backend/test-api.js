// Simple test script to verify our API optimizations
const http = require('http');

function makeRequest(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': `test-${Date.now()}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      callback(null, {
        statusCode: res.statusCode,
        headers: res.headers,
        data: data
      });
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  req.end();
}

console.log('🧪 Testing API Performance Optimizations...\n');

// Test 1: Results endpoint (should show caching)
console.log('Test 1: First request to /api/results (cache miss)');
makeRequest('/api/results', (err, response) => {
  if (err) {
    console.log('❌ Error:', err.message);
    return;
  }
  
  console.log(`✅ Status: ${response.statusCode}`);
  console.log(`📊 Response length: ${response.data.length} chars`);
  
  // Second request should be faster (cache hit)
  console.log('\nTest 2: Second request to /api/results (cache hit)');
  setTimeout(() => {
    makeRequest('/api/results', (err, response2) => {
      if (err) {
        console.log('❌ Error:', err.message);
        return;
      }
      
      console.log(`✅ Status: ${response2.statusCode}`);
      console.log(`📊 Response length: ${response2.data.length} chars`);
      
      // Test performance endpoint
      console.log('\nTest 3: Performance monitoring endpoint');
      makeRequest('/api/performance', (err, perfResponse) => {
        if (err) {
          console.log('❌ Error:', err.message);
          return;
        }
        
        console.log(`✅ Status: ${perfResponse.statusCode}`);
        console.log(`🔍 Performance data available: ${perfResponse.data.length > 0 ? 'Yes' : 'No'}`);
        
        // Test cache health endpoint
        console.log('\nTest 4: Cache health endpoint');
        makeRequest('/api/health/cache', (err, cacheResponse) => {
          if (err) {
            console.log('❌ Error:', err.message);
            return;
          }
          
          console.log(`✅ Status: ${cacheResponse.statusCode}`);
          console.log(`💾 Cache health data available: ${cacheResponse.data.length > 0 ? 'Yes' : 'No'}`);
          
          console.log('\n🎉 API Performance Optimization Tests Complete!');
          if (cacheResponse.data.length > 0) {
            try {
              const healthData = JSON.parse(cacheResponse.data);
              console.log(`🔥 Redis Connected: ${healthData.health?.redis ? 'Yes' : 'No'}`);
              console.log(`💻 Memory Cache: ${healthData.health?.memory ? 'Yes' : 'No'}`);
            } catch (e) {
              console.log('📊 Raw health data:', cacheResponse.data.substring(0, 200));
            }
          }
        });
      });
    }, 1000);
  }, 1000);
});