# StockFlowPro: Comprehensive Inventory Management System Prompt

Create a modern, real-time inventory management web application called StockFlowPro that enables teams to track and manage stock items across multiple storerooms with role-based access control and transaction workflows.

## 1. Technical Architecture

### Application Architecture
- Build a Next.js application using the App Router pattern
- Implement a client-side rendered (CSR) approach for dynamic components with "use client" directives
- Use a component-based architecture with reusable UI components from shadcn/ui
- Implement a responsive design that works on desktop and mobile devices
- Use Tailwind CSS for styling with a glassmorphic UI design system
- Implement role-based access control with five distinct user roles

### State Management
- Use React's built-in state management (useState, useEffect) for component-level state
- Implement form state management using react-hook-form with zod validation
- Store authentication state in localStorage for persistence between sessions
- Use URL state for tab selection and filtering in list views

### Data Flow
- Implement mock data services that simulate backend API calls
- Use client-side filtering, sorting, and pagination for data tables
- Implement optimistic UI updates for better user experience
- Add loading states and error handling for all data operations

## 2. Detailed Folder Structure

```
/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── analytics/       # Analytics page
│   │   ├── approvals/       # Approvals management page
│   │   ├── calculator/      # Inventory calculators page
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── inventory/       # Inventory management page
│   │   ├── settings/        # User and system settings page
│   │   ├── storeroom/       # Storeroom management page
│   │   ├── transactions/    # Transaction management pages
│   │   │   ├── issuance/    # Issuance transaction page
│   │   │   ├── receipt/     # Receipt transaction page
│   │   │   ├── swap/        # Swap transaction page
│   │   │   └── transfer/    # Transfer transaction page
│   │   ├── users/           # User management page
│   │   ├── globals.css      # Global CSS styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Home/login page
│   ├── components/          # Reusable components
│   │   ├── auth/            # Authentication components
│   │   │   └── LoginForm.tsx
│   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── ActionCards.tsx
│   │   │   ├── InventoryStatusChart.tsx
│   │   │   └── PendingApprovals.tsx
│   │   ├── inventory/       # Inventory-specific components
│   │   │   ├── InventoryTable.tsx
│   │   │   └── TransactionInitiator.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── transactions/    # Transaction-specific components
│   │   │   ├── IssuanceForm.tsx
│   │   │   ├── ReceiptForm.tsx
│   │   │   ├── SwapForm.tsx
│   │   │   ├── TransactionDetail.tsx
│   │   │   ├── TransactionsList.tsx
│   │   │   └── TransferForm.tsx
│   │   └── ui/              # UI components from shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── form.tsx
│   │       └── ... (other UI components)
│   └── lib/                 # Utility functions and hooks
│       └── utils.ts         # Common utility functions
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
└── package.json             # Project dependencies and scripts
```

## 3. Key Features

### Authentication & Authorization
- Implement a simple email/password authentication system with role selection
- Store authentication state in localStorage with an expiration time
- Implement role-based access control with five distinct roles:
  - Admin: Full access to all features and settings
  - Supervisor: Approves transactions and manages department resources
  - Storeman: Manages physical inventory and processes transactions
  - Clerk: Creates transaction requests and views inventory
  - Supplier: Views purchase orders and submits delivery notes
- Protect routes based on user role using AuthLayout component
- Implement a login page with role selection dropdown
- Add a sign-out functionality that clears the session

### Dashboard
- Create a role-specific dashboard with summary cards showing:
  - Total inventory items
  - Low stock items
  - Pending transactions
  - Recent activity
- Implement action cards that display role-specific actions
- Add an inventory status chart showing stock levels across storerooms
- Display pending approvals that require attention
- Implement tabs for switching between overview and approvals

### Inventory Management
- Create an inventory table with the following features:
  - Filtering by storeroom, category, and status
  - Sorting by any column
  - Searching by name or SKU
  - Detailed view of individual items
  - Transaction initiation from item context menu
- Implement an inventory overview chart showing stock status by storeroom
- Add a transaction initiator component with tabs for different transaction types

### Transaction Workflows
- Implement four transaction types:
  - Receipt: Record items received from suppliers
  - Issuance: Request items to be issued from inventory
  - Transfer: Move items between storerooms
  - Swap: Exchange items between storerooms
- Create dedicated forms for each transaction type with appropriate fields
- Implement a multi-stage approval process with role-based approvers
- Add transaction status tracking (draft, pending, approved, rejected)
- Create a transaction detail view with tabs for details, approval workflow, documents, and history
- Implement a transactions list with filtering by type and status

### Storeroom Management
- Create a storeroom management page showing all storerooms
- Display storeroom details including location, manager, and item count
- Add actions for editing storeroom information and viewing items

### User Management
- Implement a user management page for administrators
- Display user details including name, email, role, and department
- Add filtering by role and search functionality
- Include actions for adding, editing, and removing users

### Settings
- Create a settings page with tabs for different setting categories:
  - General: Company information and system preferences
  - Notifications: Configure notification preferences
  - Security: Password and security settings
  - Appearance: UI customization options
  - Advanced: System configuration options

### Analytics
- Implement an analytics page with charts for:
  - Inventory turnover
  - Stock levels by category
  - Transaction volume over time

### Calculators
- Create inventory calculators for:
  - Reorder Point: Calculate when to reorder based on usage and lead time
  - Economic Order Quantity (EOQ): Calculate optimal order size

## 4. Technical Highlights

### UI/UX Design
- Implement a glassmorphic UI design with:
  - Semi-transparent backgrounds with backdrop blur
  - Subtle borders with low opacity
  - Soft shadows for depth
  - Consistent color scheme with primary and accent colors
- Add micro-interactions and hover effects for better user experience
- Use responsive design patterns that work on all device sizes
- Implement consistent spacing and typography throughout the application

### Form Handling
- Use react-hook-form for all forms with zod validation schemas
- Implement multi-step forms for complex transactions
- Add form state persistence for drafts
- Include field-level validation with helpful error messages
- Create dynamic form fields that can be added or removed

### Data Visualization
- Use Recharts for creating interactive charts and graphs
- Implement bar charts, pie charts, and line charts for different data views
- Add responsive charts that resize based on container width
- Include tooltips and legends for better data interpretation
- Use consistent color schemes for data categories

### Mock Services
- Create mock data services that simulate backend API calls
- Implement setTimeout to simulate network latency
- Add loading states during simulated API calls
- Store mock data in localStorage to persist between sessions
- Implement CRUD operations for all data entities

### Component Architecture
- Create reusable UI components using shadcn/ui as a foundation
- Implement compound components for complex UI patterns
- Use TypeScript interfaces for component props
- Add default props for all components
- Implement proper prop drilling and composition

## 5. Development Approach

### Modularization
- Break down the application into small, reusable components
- Organize components by feature and functionality
- Create clear interfaces between components
- Use TypeScript for type safety and better developer experience
- Implement consistent naming conventions

### Error Handling
- Add try/catch blocks for all asynchronous operations
- Implement graceful error states for components
- Display user-friendly error messages
- Add fallback UI for failed component rendering
- Log errors to console in development mode

### Performance Optimization
- Implement code splitting using Next.js dynamic imports
- Optimize images and assets
- Use memoization for expensive calculations
- Implement virtualized lists for large data sets
- Add debouncing for search inputs

### Accessibility
- Use semantic HTML elements
- Add proper ARIA attributes
- Ensure keyboard navigation works throughout the application
- Maintain sufficient color contrast
- Test with screen readers

### Testing Strategy
- Implement unit tests for utility functions
- Add component tests for UI components
- Create integration tests for key user flows
- Implement end-to-end tests for critical paths
- Use mock data for testing

## 6. Database Structure

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'storeman', 'clerk', 'supplier')),
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storerooms Table
```sql
CREATE TABLE storerooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Items Table
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id),
  description TEXT,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id),
  storeroom_id UUID REFERENCES storerooms(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, storeroom_id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('receipt', 'issuance', 'transfer', 'swap')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  source_storeroom_id UUID REFERENCES storerooms(id),
  dest_storeroom_id UUID REFERENCES storerooms(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  reference_number VARCHAR(100),
  supplier_name VARCHAR(255)
);
```

### Transaction Items Table
```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  direction VARCHAR(10) CHECK (direction IN ('in', 'out')),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Approval Workflow Table
```sql
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  sequence_number INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approver_id UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Example Queries

#### Get Inventory Items with Status
```sql
SELECT 
  i.id, 
  it.name, 
  it.sku, 
  c.name as category, 
  i.quantity, 
  it.unit, 
  s.name as storeroom,
  CASE 
    WHEN i.quantity <= 0 THEN 'Out of Stock'
    WHEN i.quantity <= i.min_quantity THEN 'Low Stock'
    ELSE 'In Stock'
  END as status,
  i.last_updated
FROM inventory i
JOIN items it ON i.item_id = it.id
JOIN storerooms s ON i.storeroom_id = s.id
JOIN categories c ON it.category_id = c.id
WHERE s.id = $1
ORDER BY it.name;
```

#### Get Pending Approvals for User
```sql
SELECT 
  t.id, 
  t.transaction_number, 
  t.type, 
  u.name as created_by, 
  t.created_at, 
  COUNT(ti.id) as item_count
FROM transactions t
JOIN users u ON t.created_by = u.id
JOIN transaction_items ti ON t.id = ti.transaction_id
JOIN approval_workflows aw ON t.id = aw.transaction_id
WHERE aw.approver_role = $1
AND aw.status = 'pending'
AND t.status = 'pending'
GROUP BY t.id, t.transaction_number, t.type, u.name, t.created_at
ORDER BY t.created_at DESC;
```

#### Update Inventory After Transaction Approval
```sql
-- For receipt transaction
UPDATE inventory
SET quantity = quantity + $1, last_updated = NOW()
WHERE item_id = $2 AND storeroom_id = $3;

-- If no record exists, insert one
INSERT INTO inventory (item_id, storeroom_id, quantity, last_updated)
SELECT $2, $3, $1, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM inventory WHERE item_id = $2 AND storeroom_id = $3
);
```

## 7. Future Improvements

### Real-time Updates
- Implement WebSocket connections for real-time updates
- Add notifications for transaction status changes
- Implement real-time inventory level updates
- Add collaborative features for simultaneous work

### Advanced Analytics
- Implement predictive analytics for inventory forecasting
- Add trend analysis for inventory consumption
- Create custom report builder
- Implement data export in multiple formats

### Mobile Application
- Develop a companion mobile app for on-the-go inventory management
- Add barcode/QR code scanning for quick item lookup
- Implement offline mode with synchronization
- Add push notifications for important events

### Integration Capabilities
- Create API endpoints for integration with other systems
- Implement webhooks for event-driven integrations
- Add support for importing/exporting data in standard formats
- Integrate with accounting and ERP systems

### Advanced Security
- Implement multi-factor authentication
- Add IP-based access restrictions
- Create audit logs for all system actions
- Implement data encryption at rest and in transit

## 8. Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **Form Handling**: react-hook-form with zod validation
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend (Simulated)
- **Authentication**: Custom authentication with localStorage
- **Data Storage**: Mock data with localStorage persistence
- **API Simulation**: Timeout-based mock services

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git
- **Build Tool**: Next.js built-in build system

## 9. Security Considerations

### Authentication Security
- Implement proper password hashing (in a real backend)
- Add session timeout and automatic logout
- Implement CSRF protection
- Use secure and HTTP-only cookies
- Add rate limiting for login attempts

### Authorization Controls
- Implement role-based access control (RBAC)
- Add fine-grained permissions for actions
- Validate all access on both client and server
- Implement proper route protection
- Add audit logging for sensitive actions

### Data Security
- Validate all input data
- Sanitize output to prevent XSS
- Implement proper error handling without leaking information
- Add data encryption for sensitive information
- Implement secure data deletion policies

### Frontend Security
- Use Content Security Policy (CSP)
- Implement Subresource Integrity (SRI) for external resources
- Add security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Prevent clickjacking with proper headers
- Implement secure form handling

### Operational Security
- Keep dependencies updated
- Implement security scanning in CI/CD pipeline
- Add regular security audits
- Create a security incident response plan
- Implement proper logging and monitoring

## Implementation Guidelines

1. Start by setting up the Next.js project with TypeScript and Tailwind CSS
2. Install and configure shadcn/ui components
3. Create the basic layout components (AuthLayout, DashboardLayout, Sidebar, Header)
4. Implement the authentication system with role-based access control
5. Build the dashboard page with summary cards and charts
6. Create the inventory management system with filtering and sorting
7. Implement the transaction workflows for all transaction types
8. Add the approval process for transactions
9. Build the user and storeroom management pages
10. Implement the settings and analytics pages
11. Add the calculator functionality
12. Implement responsive design for all pages
13. Add error handling and loading states
14. Test all user flows and fix any issues
15. Optimize performance and accessibility

Follow these guidelines to create a comprehensive inventory management system with role-based access control and transaction workflows.