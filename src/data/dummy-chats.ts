import { Chat } from "@/hooks/use-chat-store";
import { v4 as uuidv4 } from "uuid";

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

export const dummyChats: Chat[] = [
  {
    id: uuidv4(),
    title: "Show all users who signed up this month",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "Show all users who signed up this month",
        createdAt: now,
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I'll query the users table to find all users who signed up this month.

\`\`\`sql
SELECT id, name, email, created_at
FROM users
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY created_at DESC;
\`\`\`

**Query Results:**

| id | name | email | created_at |
|---|---|---|---|
| 1 | John Smith | john@example.com | 2024-01-15 |
| 2 | Sarah Johnson | sarah@example.com | 2024-01-12 |
| 3 | Mike Wilson | mike@example.com | 2024-01-08 |
| 4 | Emily Brown | emily@example.com | 2024-01-05 |
| 5 | David Lee | david@example.com | 2024-01-02 |

**Summary:** Found 5 users who signed up this month. The most recent signup was John Smith on January 15th.`,
        createdAt: new Date(now.getTime() + 1000),
      },
      {
        id: uuidv4(),
        role: "user",
        content: "How many of them have made a purchase?",
        createdAt: new Date(now.getTime() + 60000),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `Let me check the orders table to see which of these new users have made purchases.

\`\`\`sql
SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;
\`\`\`

**Query Results:**

| name | email | order_count | total_spent |
|---|---|---|---|
| Sarah Johnson | sarah@example.com | 3 | $425.00 |
| John Smith | john@example.com | 2 | $189.50 |
| Emily Brown | emily@example.com | 1 | $75.00 |

**Insights:**
- 3 out of 5 new users (60%) have made at least one purchase
- Sarah Johnson is the top spender with 3 orders totaling $425.00
- Total revenue from new users this month: $689.50`,
        createdAt: new Date(now.getTime() + 120000),
      },
    ],
  },
  {
    id: uuidv4(),
    title: "What are the top selling products?",
    createdAt: yesterday,
    updatedAt: yesterday,
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "What are the top selling products this quarter?",
        createdAt: yesterday,
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I'll analyze the sales data to find your top performing products this quarter.

\`\`\`sql
SELECT
  p.name as product_name,
  p.category,
  SUM(oi.quantity) as units_sold,
  SUM(oi.quantity * oi.price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= DATE_TRUNC('quarter', CURRENT_DATE)
GROUP BY p.id, p.name, p.category
ORDER BY revenue DESC
LIMIT 10;
\`\`\`

**Top 10 Products by Revenue:**

| Product | Category | Units Sold | Revenue |
|---|---|---|---|
| Premium Wireless Headphones | Electronics | 245 | $24,255 |
| Ergonomic Office Chair | Furniture | 89 | $17,711 |
| Smart Watch Pro | Electronics | 156 | $15,444 |
| Standing Desk | Furniture | 67 | $13,333 |
| Mechanical Keyboard | Electronics | 203 | $10,149 |

**Key Insights:**
- Electronics category dominates with 3 of the top 5 products
- Premium Wireless Headphones lead with $24,255 in revenue
- Furniture shows strong performance with high average order value`,
        createdAt: new Date(yesterday.getTime() + 1000),
      },
    ],
  },
  {
    id: uuidv4(),
    title: "Show me customer churn analysis",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "Can you show me customer churn analysis for the last 6 months?",
        createdAt: twoDaysAgo,
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I'll analyze customer activity to identify churn patterns over the last 6 months.

\`\`\`sql
WITH customer_activity AS (
  SELECT
    u.id,
    u.email,
    MAX(o.created_at) as last_order_date,
    COUNT(o.id) as total_orders,
    CASE
      WHEN MAX(o.created_at) < NOW() - INTERVAL '90 days' THEN 'Churned'
      WHEN MAX(o.created_at) < NOW() - INTERVAL '30 days' THEN 'At Risk'
      ELSE 'Active'
    END as status
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.created_at <= NOW() - INTERVAL '6 months'
  GROUP BY u.id, u.email
)
SELECT status, COUNT(*) as customer_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM customer_activity
GROUP BY status;
\`\`\`

**Churn Analysis Results:**

| Status | Customer Count | Percentage |
|---|---|---|
| Active | 1,245 | 62.3% |
| At Risk | 423 | 21.1% |
| Churned | 332 | 16.6% |

**Recommendations:**
1. **At Risk Customers (423):** Send targeted re-engagement emails with special offers
2. **Churned Customers (332):** Consider a win-back campaign with significant discounts
3. **Active Customers (1,245):** Implement loyalty rewards to maintain engagement`,
        createdAt: new Date(twoDaysAgo.getTime() + 1000),
      },
      {
        id: uuidv4(),
        role: "user",
        content: "What are the main reasons for churn?",
        createdAt: new Date(twoDaysAgo.getTime() + 120000),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `Let me analyze the feedback and support tickets from churned customers.

\`\`\`sql
SELECT
  cf.reason_category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM customer_feedback cf
JOIN users u ON cf.user_id = u.id
WHERE cf.feedback_type = 'churn_reason'
  AND cf.created_at >= NOW() - INTERVAL '6 months'
GROUP BY cf.reason_category
ORDER BY count DESC;
\`\`\`

**Churn Reasons Breakdown:**

| Reason | Count | Percentage |
|---|---|---|
| Price concerns | 98 | 29.5% |
| Found competitor | 72 | 21.7% |
| Product quality issues | 54 | 16.3% |
| Poor customer support | 43 | 13.0% |
| No longer needed | 38 | 11.4% |
| Other | 27 | 8.1% |

**Action Items:**
1. **Price (29.5%):** Review pricing strategy, consider loyalty discounts
2. **Competition (21.7%):** Conduct competitive analysis, highlight unique value props
3. **Quality (16.3%):** Investigate recent quality issues, improve QA process`,
        createdAt: new Date(twoDaysAgo.getTime() + 180000),
      },
    ],
  },
  {
    id: uuidv4(),
    title: "Database performance analysis",
    createdAt: lastWeek,
    updatedAt: lastWeek,
    messages: [
      {
        id: uuidv4(),
        role: "user",
        content: "Can you analyze our database performance? Which queries are running slow?",
        createdAt: lastWeek,
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I'll check the query performance statistics to identify slow-running queries.

\`\`\`sql
SELECT
  query,
  calls,
  ROUND(total_time::numeric, 2) as total_time_ms,
  ROUND(mean_time::numeric, 2) as avg_time_ms,
  ROUND(max_time::numeric, 2) as max_time_ms
FROM pg_stat_statements
WHERE total_time > 1000
ORDER BY total_time DESC
LIMIT 5;
\`\`\`

**Slowest Queries:**

| Query | Calls | Total Time | Avg Time | Max Time |
|---|---|---|---|---|
| SELECT * FROM orders WHERE... | 15,432 | 45,230ms | 2.93ms | 156ms |
| SELECT COUNT(*) FROM users... | 8,921 | 32,445ms | 3.64ms | 89ms |
| UPDATE inventory SET... | 4,532 | 28,776ms | 6.35ms | 234ms |

**Performance Issues Identified:**

1. **Missing Index:** The orders query is doing a full table scan
   \`\`\`sql
   CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
   \`\`\`

2. **Unoptimized COUNT:** Consider using approximate counts for large tables

3. **Lock Contention:** Inventory updates may benefit from row-level locking

Would you like me to generate the optimization scripts?`,
        createdAt: new Date(lastWeek.getTime() + 1000),
      },
    ],
  },
];
