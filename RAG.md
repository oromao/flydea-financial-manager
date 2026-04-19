# Local RAG System Documentation

## Overview

The Flydea Financial Manager includes a **local Retrieval-Augmented Generation (RAG)** system that provides personalized financial insights without external API dependencies or costs.

## How It Works

### 1. **Knowledge Base**
Located in `/src/lib/rag/knowledge-base.ts`, the knowledge base contains financial education documents in Portuguese covering:
- Budgeting and financial planning
- Cash flow management
- Expense optimization strategies
- Income growth strategies
- Debt management
- Emergency fund planning
- Savings strategies
- Financial health assessment

Initial knowledge base has 14+ documents and grows through retrofeeding jobs.

### 2. **Embeddings & Similarity**
Located in `/src/lib/rag/embeddings.ts`, uses TF-IDF (Term Frequency-Inverse Document Frequency) for:
- Converting text into numerical vectors
- Measuring similarity between documents
- Finding most relevant knowledge for user queries

No external ML models required - pure algorithmic approach.

### 3. **Query Engine**
Located in `/src/lib/rag/query-engine.ts`, the query engine:
- Detects user intent from queries (7 types: expense optimization, income growth, cash flow, spending patterns, debt, health check, general)
- Retrieves relevant knowledge documents
- Incorporates user's actual financial data
- Generates personalized responses with specific numbers and recommendations

### 4. **Chat Interface**
Located in `/src/components/financial-ai-chat.tsx`:
- User-facing chat component
- Message history with timestamps
- Real-time response loading states
- Quick suggestion buttons
- Auto-scrolling to latest messages
- Responsive design for mobile and desktop

### 5. **API Endpoint**
Located in `/src/app/api/rag/local-query/route.ts`:
- POST endpoint for processing queries
- Requires authentication (NextAuth)
- Returns personalized insights + source documents + financial metrics
- Zero external API calls

## Features

### Intent Detection
The RAG system intelligently detects user intent and provides specialized responses:

1. **Expense Optimization** (`economiz`, `reduz`, `cortar`)
   - Identifies top expense categories
   - Provides reduction strategies
   - Shows potential monthly savings

2. **Income Growth** (`receita`, `renda`, `aument`)
   - Evaluates current income level
   - Suggests short/medium/long-term options
   - Addresses deficit situations

3. **Cash Flow Analysis** (`fluxo`, `caixa`, `projeç`)
   - Displays monthly income vs. expenses
   - Projects next 3 months
   - Identifies trends

4. **Spending Patterns** (`padrão`, `gasto`, `despesa`)
   - Shows expense breakdown by category
   - Identifies anomalies
   - Trends over time

5. **Debt Management** (`dívida`, `pendente`, `vencer`)
   - Analyzes pending payments
   - Recommends payoff strategies
   - Suggests negotiation tactics

6. **Financial Health Check** (`saúde`, `situação`, `geral`)
   - Calculates health score (0-100)
   - Shows key indicators
   - Provides personalized next steps

7. **General Assistance**
   - Combines knowledge with user data
   - Educational content
   - Financial literacy support

### Personalization
Every response includes:
- User's actual financial metrics
- Specific dollar amounts and percentages
- Relevant knowledge from the base
- Actionable next steps
- Source references

Example response incorporates:
```
Your biggest expense: Rent at R$ 1,500 (25% of total)
Even 10% reduction = R$ 150/month savings
Strategies based on your specific situation
References to relevant knowledge articles
```

## Retrofeeding Job

The RAG system automatically grows its knowledge base through periodic retrofeeding.

### Location
`/src/jobs/rag-retrofeeding.ts` - Retrofeeding logic
`/src/app/api/cron/rag-retrofeeding/route.ts` - Cron endpoint

### Current Knowledge Sources
The retrofeeding job adds 6 additional documents on:
1. The 50-30-20 budgeting rule in practice
2. Financial life cycles (accumulation, consolidation, pre-retirement, retirement)
3. Investment basics for beginners
4. Negotiation tactics for financial services
5. Quarterly financial review process
6. Psychology of spending and impulse control

### Setup Instructions

#### Option 1: Vercel Cron (Production)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/rag-retrofeeding",
    "schedule": "0 0 * * *"
  }]
}
```

Then add environment variable:
```
CRON_SECRET=your-secure-random-token
```

Call would be authorized with:
```
Authorization: Bearer your-secure-random-token
```

#### Option 2: External Service (e.g., EasyCron, Zapier)
Schedule HTTP POST to:
```
https://your-domain.com/api/cron/rag-retrofeeding
Headers:
  Authorization: Bearer your-secret-token
```

#### Option 3: Local Testing
For development, call via GET:
```bash
curl http://localhost:3000/api/cron/rag-retrofeeding
```

Responds with:
```json
{
  "success": true,
  "message": "RAG retrofeeding completed. Added 6 documents.",
  "stats": {
    "documentsAdded": 6,
    "totalDocuments": 20
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Architecture

### Technology Stack
- **Language**: TypeScript
- **Framework**: Next.js 16
- **Storage**: In-memory (can be extended to database)
- **Algorithms**: TF-IDF embeddings, cosine similarity
- **UI**: React components, Framer Motion animations, Tailwind CSS

### Data Flow
```
User Query (Chat Interface)
    ↓
/api/rag/local-query endpoint
    ↓
Query Engine
    ├─ Detect Intent
    ├─ Retrieve Relevant Documents
    ├─ Fetch User Financial Data
    └─ Generate Response
    ↓
Personalized Insight + Sources
    ↓
Chat Component (Display)
```

### Document Structure
```typescript
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string; // Portuguese financial advice
  category: 'budgeting' | 'cash-flow' | 'expenses' | 'income' | 'investments' | 'emergency' | 'debt' | 'general';
  tags: string[]; // Search/filter metadata
  createdAt: Date;
}
```

## Testing

### Unit Tests
Location: `__tests__/rag-*.test.ts`
```bash
npm test -- __tests__/rag
```

Coverage:
- **53 tests** across 3 test files
- Embeddings (tokenization, similarity calculations)
- Knowledge base (add, search, filter operations)
- Query engine (intent detection, response generation)

### E2E Tests
Location: `tests/e2e/rag-chat.spec.ts`
```bash
npm run test:e2e rag-chat.spec.ts
```

Coverage:
- Page load and UI visibility
- Chat interface functionality
- Message sending and responses
- Loading states and button disabling
- API authentication
- Multi-message conversations
- Auto-scrolling behavior

## Performance

### Metrics
- **Embedding generation**: < 50ms for typical queries
- **Similarity calculation**: < 10ms for 20 documents
- **API response time**: < 500ms (including financial data fetch)
- **Retrofeeding job**: < 100ms for 6 new documents

### Optimization Strategies
1. Pre-compute document embeddings (not implemented yet, but recommended for scale)
2. Cache frequently accessed queries (not implemented yet)
3. Batch retrofeeding operations
4. Index knowledge by category for faster retrieval

## Future Enhancements

### Short Term
- [ ] Add user feedback (thumbs up/down) to improve response quality
- [ ] Implement follow-up question suggestions
- [ ] Add document preview/links in responses
- [ ] Multi-language support (English, Spanish)

### Medium Term
- [ ] Persistent knowledge base (PostgreSQL/MongoDB)
- [ ] User conversation history
- [ ] Analytics on common questions
- [ ] Admin UI for knowledge base management
- [ ] Custom document uploads by admins

### Long Term
- [ ] Machine learning feedback loop (learn from user corrections)
- [ ] Context-aware follow-ups (remember previous queries)
- [ ] Integration with financial APIs for real-time market data
- [ ] Multi-user knowledge sharing
- [ ] Custom financial advice rules per user

## Troubleshooting

### Issue: Empty responses from RAG
**Solution**: Check if knowledge base is loaded. Verify `/api/rag/local-query` returns documents.

### Issue: Retrofeeding job not running
**Solution**: 
1. Verify CRON_SECRET is set in production
2. Check logs at `/api/cron/rag-retrofeeding`
3. Call manually to test: `curl http://localhost:3000/api/cron/rag-retrofeeding`

### Issue: Slow chat responses
**Solution**:
1. Profile with Chrome DevTools
2. Check financial data fetch time
3. Consider pre-computing embeddings
4. Reduce topK parameter in query engine

### Issue: Low quality responses
**Solution**:
1. Add more relevant documents to knowledge base
2. Improve document titles and content clarity
3. Add more specific tags for better retrieval
4. Implement user feedback mechanism

## Adding Custom Knowledge

To add financial knowledge to the RAG system:

1. **Edit `/src/lib/rag/knowledge-base.ts`**:
```typescript
const INITIAL_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  // ... existing documents
  {
    id: 'my-custom-doc',
    title: 'My Financial Topic',
    content: 'Detailed financial advice in Portuguese',
    category: 'budgeting', // or other category
    tags: ['tag1', 'tag2'],
    createdAt: new Date(),
  }
];
```

2. **Or use retrofeeding job** in `/src/jobs/rag-retrofeeding.ts`:
```typescript
const FINANCIAL_KNOWLEDGE_SOURCES = [
  // ... existing sources
  {
    title: 'My Topic',
    content: 'Content',
    category: 'budgeting',
    tags: ['tags'],
  }
];
```

3. **Rebuild and test**:
```bash
npm run build
npm test -- __tests__/rag
```

## API Reference

### POST /api/rag/local-query
**Authentication**: Required (NextAuth session)

**Request**:
```json
{
  "query": "Como posso economizar mais?"
}
```

**Response (200 OK)**:
```json
{
  "response": "# 💰 Oportunidades de Economia\n\n...",
  "sources": [
    {
      "id": "budget-basics",
      "title": "Fundamentos do Orçamento Pessoal",
      "category": "budgeting"
    }
  ],
  "metrics": {
    "totalBalance": 15000,
    "monthlyIncome": 5000,
    "monthlyExpenses": 2000,
    "netFlow": 3000,
    "topExpenseCategory": "Moradia"
  }
}
```

**Error (401 Unauthorized)**:
```json
{
  "error": "Unauthorized"
}
```

### GET /api/rag/local-query
**Purpose**: Health check
**Response (200 OK)**:
```json
{
  "status": "available",
  "message": "Local RAG endpoint is ready",
  "type": "local-rag"
}
```

### POST /api/cron/rag-retrofeeding
**Authentication**: Bearer token (CRON_SECRET)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "RAG retrofeeding completed. Added 6 documents.",
  "stats": {
    "documentsAdded": 6,
    "totalDocuments": 20
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Contributing

To improve the RAG system:

1. Add knowledge documents to the base
2. Write unit tests in `__tests__/rag-*.test.ts`
3. Add E2E tests in `tests/e2e/rag-*.spec.ts`
4. Test response quality with various queries
5. Submit feedback for response improvements

## License

This RAG system is part of Flydea Financial Manager and follows the same license as the main project.
