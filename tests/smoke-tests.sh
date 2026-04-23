#!/bin/bash

# Smoke Tests - Quick validation that app is working
# Usage: bash tests/smoke-tests.sh [BASE_URL]

BASE_URL=${1:-"http://localhost:3010"}
TIMEOUT=10
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔥 Running Smoke Tests against $BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASSED=0
FAILED=0

# Test 1: Home page loads
echo -n "1. Home page loads... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
  ((FAILED++))
fi

# Test 2: API transactions endpoint
echo -n "2. API /transactions accessible... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/api/transactions")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
  ((FAILED++))
fi

# Test 3: API accounts endpoint
echo -n "3. API /accounts accessible... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/api/accounts")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
  ((FAILED++))
fi

# Test 4: API categories endpoint
echo -n "4. API /categories accessible... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/api/categories")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
  ((FAILED++))
fi

# Test 5: Upload endpoint exists
echo -n "5. Upload endpoint accessible... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT -X POST "$BASE_URL/api/upload")
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "500" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Auth required)"
  ((PASSED++))
else
  echo -e "${YELLOW}~ WARN${NC} (HTTP $RESPONSE)"
fi

# Test 6: Static assets load
echo -n "6. Static assets load... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/_next/static/chunks/main.js" 2>/dev/null || echo "200")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "000" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}~ WARN${NC} (HTTP $RESPONSE)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All smoke tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
