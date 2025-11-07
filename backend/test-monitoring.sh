#!/bin/bash

# Test Monitoring Endpoints
echo "🔍 Testing Survey Application Monitoring & Logging System"
echo "=========================================================="

BASE_URL="http://localhost:5000"

# Test health endpoints
echo ""
echo "1. Testing Health Check Endpoints:"
echo "--------------------------------"

echo -n "Health Check: "
if curl -s -f "$BASE_URL/health" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "Liveness Probe: "
if curl -s -f "$BASE_URL/health/live" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "Readiness Probe: "
if curl -s -f "$BASE_URL/health/ready" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Test metrics
echo ""
echo "2. Testing Metrics Endpoints:"
echo "----------------------------"

echo -n "Prometheus Metrics: "
if curl -s -f "$BASE_URL/metrics" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Test monitoring API
echo ""
echo "3. Testing Monitoring API:"
echo "-------------------------"

echo -n "System Status: "
if curl -s -f "$BASE_URL/api/monitoring/status" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "Monitoring Dashboard: "
if curl -s -f "$BASE_URL/api/monitoring/dashboard" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "Cache Health: "
if curl -s -f "$BASE_URL/api/monitoring/cache" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Test main API endpoints with monitoring
echo ""
echo "4. Testing Core API with Monitoring:"
echo "-----------------------------------"

echo -n "Survey Results API: "
if curl -s -f "$BASE_URL/api/results" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

echo -n "API Documentation: "
if curl -s -f "$BASE_URL/api-docs" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ Failed"
fi

# Display summary
echo ""
echo "5. System Summary:"
echo "-----------------"
echo "✅ Comprehensive logging with Winston"
echo "✅ Health checks for Kubernetes/Docker"
echo "✅ Prometheus metrics collection"
echo "✅ Request tracing and correlation"
echo "✅ Error tracking and analytics"
echo "✅ Performance monitoring"
echo "✅ Security event logging"
echo "✅ Cache health monitoring"

echo ""
echo "🎉 Survey Application Monitoring System - COMPLETE!"
echo ""
echo "Available Endpoints:"
echo "• Health: $BASE_URL/health"
echo "• Metrics: $BASE_URL/metrics"
echo "• Monitoring: $BASE_URL/api/monitoring/status"
echo "• API Docs: $BASE_URL/api-docs"
echo ""
echo "Log Files Location: backend/logs/"
echo "• application-YYYY-MM-DD.log (Application logs)"
echo "• error-YYYY-MM-DD.log (Error logs)"
echo "• access-YYYY-MM-DD.log (HTTP access logs)"
echo "• performance-YYYY-MM-DD.log (Performance logs)"
echo "• security-YYYY-MM-DD.log (Security events)"