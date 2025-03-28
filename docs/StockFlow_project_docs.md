


---

### 1. Product Requirements Document (PRD)

**Title**: StockFlowPro - Real-Time Inventory Management System  
**Version**: 1.0  
**Date**: March 27, 2025  
  

#### Overview
StockFlowPro is a modern, real-time inventory management web application built to streamline stock tracking and transaction workflows across multiple storerooms. 
It features role-based access control (RBAC), a glassmorphic UI, and integration with Supabase for data persistence and real-time updates.

#### Objectives
- Enable teams to manage inventory efficiently with real-time visibility.
- Support transaction workflows (Receipt, Issuance, Transfer, Swap) with multi-stage approvals.
- Provide role-specific dashboards and analytics for decision-making.
- Ensure scalability, security, and accessibility.

#### Stakeholders
- **End Users**: Admin, Supervisor, Storeman, Clerk, Supplier.
- **Developers**: Frontend, Backend, QA teams.
- **Product Owner**: Defines feature priorities and acceptance criteria.

#### Functional Requirements
1. **Authentication & Authorization**
   - Email/password login with Supabase Auth.
   - Role-based access: Admin (full access), Supervisor (approvals), Storeman (inventory), Clerk (requests), Supplier (delivery notes).
   - User registration (Admin only), password reset, and session management.
2. **Dashboard**
   - Role-specific summary cards (total items, low stock, pending transactions).
   - Real-time inventory status chart.
   - Pending approvals list with actions (approve/reject).
3. **Inventory Management**
   - Filterable, sortable, searchable inventory table.
   - CRUD operations for items and inventory records.
   - Transaction initiation from item context menu.
4. **Transaction Workflows**
   - Forms for Receipt, Issuance, Transfer, Swap with item selection and validation.
   - Multi-stage approval process with status tracking (draft, pending, approved, rejected).
   - Document upload for transactions.
5. **Storeroom Management**
   - CRUD operations for storerooms with manager assignment.
   - Detailed storeroom views with item lists.
6. **User Management**
   - Admin-only CRUD for users with role/department filtering.
7. **Settings**
   - Tabs for general, notifications, security, and appearance settings.
8. **Analytics**
   - Charts for inventory turnover, stock levels, and transaction volume.
9. **Calculators**
   - Reorder Point and Economic Order Quantity (EOQ) calculators.

#### Non-Functional Requirements
- **Performance**: Page load < 2s, real-time updates within 1s.
- **Security**: Input validation, CSRF protection, rate limiting, encryption.
- **Accessibility**: WCAG 2.1 AA compliance.
- **Scalability**: Support 1,000+ users and 10,000+ inventory items.

#### Assumptions
- Supabase is the sole backend provider.
- Users have modern browsers (Chrome, Firefox, Edge).

#### Constraints
- Initial release focuses on web, not mobile app.
- Mock data replaced with real data in production.

#### Deliverables
- Fully functional web app deployed on Vercel.
- Documentation: API references, user guide, setup instructions.

---

### 2. Folder Structure

Below is the proposed folder structure, enhancing the existing one for completeness and maintainability.

```
tdollar15-stockflow-tempo/
├── public/                  # Static assets (images, favicon)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── analytics/       # Analytics page and components
│   │   │   └── page.tsx
│   │   ├── approvals/       # Approvals management
│   │   │   └── page.tsx
│   │   ├── calculator/      # Calculators page
│   │   │   └── page.tsx
│   │   ├── dashboard/       # Dashboard page
│   │   │   └── page.tsx
│   │   ├── inventory/       # Inventory management
│   │   │   └── page.tsx
│   │   ├── settings/        # Settings page
│   │   │   └── page.tsx
│   │   ├── storeroom/       # Storeroom management
│   │   │   └── page.tsx
│   │   ├── transactions/    # Transaction management
│   │   │   ├── page.tsx
│   │   │   ├── issuance/    # Issuance sub-page
│   │   │   │   └── page.tsx
│   │   │   ├── receipt/     # Receipt sub-page
│   │   │   │   └── page.tsx
│   │   │   ├── swap/        # Swap sub-page
│   │   │   │   └── page.tsx
│   │   │   └── transfer/    # Transfer sub-page
│   │   │       └── page.tsx
│   │   ├── users/           # User management
│   │   │   └── page.tsx
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home/login page
│   ├── components/          # Reusable components
│   │   ├── auth/            # Auth-related components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignUpForm.tsx  # New
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── ActionCards.tsx
│   │   │   ├── InventoryStatusChart.tsx
│   │   │   └── PendingApprovals.tsx
│   │   ├── inventory/       # Inventory components
│   │   │   ├── InventoryTable.tsx
│   │   │   └── TransactionInitiator.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── transactions/    # Transaction components
│   │   │   ├── IssuanceForm.tsx
│   │   │   ├── ReceiptForm.tsx
│   │   │   ├── SwapForm.tsx
│   │   │   ├── TransactionDetail.tsx
│   │   │   ├── TransactionModal.tsx
│   │   │   ├── TransactionsList.tsx
│   │   │   └── TransferForm.tsx
│   │   ├── ui/              # shadcn/ui components (unchanged)
│   │   └── utils/           # UI utilities
│   │       └── ErrorBoundary.tsx  # New
│   ├── lib/                 # Utilities and services
│   │   ├── api/             # API service layer
│   │   │   ├── auth.ts      # Auth API calls
│   │   │   ├── inventory.ts # Inventory API calls
│   │   │   ├── transactions.ts # Transaction API calls
│   │   │   └── users.ts     # User API calls
│   │   ├── database.types.ts # Supabase types
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts         # General utilities
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Auth state management
│   │   ├── useInventory.ts  # Inventory data fetching
│   │   └── useRealTime.ts   # Real-time subscriptions
│   └── tests/               # Test files
│       ├── unit/            # Unit tests
│       ├── integration/     # Integration tests
│       └── e2e/             # End-to-end tests
├── README.md                # Project documentation
├── StockFlowPro-Comprehensive-Prompt.md # Requirements
├── components.json          # shadcn/ui config
├── next.config.js           # Next.js config
├── package.json             # Dependencies
├── postcss.config.js        # PostCSS config
├── tailwind.config.ts       # Tailwind config
├── tempo.config.json        # Tempo config
└── tsconfig.json            # TypeScript config
```

---

### 3. Database Structure / Schema



#### Tables
1. **users**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL, -- Managed by Supabase Auth
     name VARCHAR(255) NOT NULL,
     role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'storeman', 'clerk', 'supplier')),
     department VARCHAR(100),
     status VARCHAR(50) DEFAULT 'active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **storerooms**
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

3. **categories**
   ```sql
   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **items**
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

5. **inventory**
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

6. **transactions**
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

7. **transaction_items**
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

8. **approval_workflows**
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

9. **documents**
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

**Indexes**:
- `CREATE INDEX idx_transactions_status ON transactions(status);`
- `CREATE INDEX idx_inventory_item_storeroom ON inventory(item_id, storeroom_id);`

**Notes**:
- Uses Supabase’s built-in auth for `users` password management.
- Real-time subscriptions enabled on `inventory`, `transactions`, and `approval_workflows`.

---

### 4. User Story / Flow

#### User Story: Clerk Initiates an Issuance Transaction
**Title**: As a Clerk, I want to request items from inventory so that I can use them for my department’s needs.  
**Acceptance Criteria**:
- Clerk logs in and sees dashboard with “Initiate Transaction” action.
- Clerk selects “Issuance” and fills out form with items, quantities, and purpose.
- Transaction is saved as “draft” and submitted for approval.
- Supervisor receives notification and approves/rejects it.
- Clerk sees updated status on dashboard.

**Flow**:
1. **Login**: Clerk enters email/password → Authenticated via Supabase → Redirected to dashboard.
2. **Dashboard**: Sees low stock alerts and “Initiate Transaction” card.
3. **Transaction Initiation**: Navigates to `/transactions/issuance` → Fills `IssuanceForm` → Submits.
4. **Approval**: Transaction status changes to “pending” → Supervisor reviews on `/approvals` → Approves.
5. **Completion**: Status updates to “approved” → Inventory quantity decreases → Clerk notified.

---

### 5. Transaction Flow

#### Transaction Type: Issuance
**Steps**:
1. **Initiation** (Clerk):
   - Navigate to `/transactions/issuance`.
   - Fill `IssuanceForm.tsx` (items, quantities, purpose).
   - Validate with zod → Save as “draft” in `transactions` table.
2. **Submission**:
   - Clerk submits → Status updates to “pending” → `approval_workflows` entry created (approver_role: “supervisor”).
3. **Approval** (Supervisor):
   - Views on `/approvals` → Sees `PendingApprovals.tsx`.
   - Approves via button → `approval_workflows.status` = “approved” → `transactions.status` = “approved”.
4. **Inventory Update**:
   - `inventory.quantity` decreases based on `transaction_items`.
5. **Notification**:
   - Clerk receives real-time update via Supabase subscription.

**Diagram**:
```
[Clerk] --> [Draft] --> [Pending] --> [Supervisor Approval] --> [Approved] --> [Inventory Updated]
```

---

### 6. API References

#### Base URL: Supabase REST API (`https://hfgtxcpkhcnwdsyjbojs.supabase.co/rest/v1`)
#### Headers: `{ "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer USER_TOKEN" }`

1. **GET /inventory**
   - **Description**: Fetch all inventory items.
   - **Query**: `?select=id,item_id,storeroom_id,quantity,items(name,sku),storerooms(name)`
   - **Response**: `200 OK` - Array of inventory objects.

2. **POST /transactions**
   - **Description**: Create a new transaction.
   - **Body**: `{ "transaction_number": "TR-001", "type": "issuance", "created_by": "user_id", ... }`
   - **Response**: `201 Created` - Created transaction object.

3. **PATCH /approval_workflows?id=eq.{id}**
   - **Description**: Update approval status.
   - **Body**: `{ "status": "approved", "approver_id": "user_id", "approved_at": "NOW()" }`
   - **Response**: `200 OK` - Updated workflow object.

4. **GET /users**
   - **Description**: Fetch users (Admin only).
   - **Query**: `?select=id,email,name,role`
   - **Response**: `200 OK` - Array of user objects.

**Client-Side API (src/lib/api/)**:
- `auth.ts`: `signIn(email, password)`, `signUp(email, password, role)`, `signOut()`.
- `inventory.ts`: `getInventory()`, `updateInventory(id, data)`.
- `transactions.ts`: `createTransaction(data)`, `approveTransaction(id)`.

---

### 7. Authentication & Authorization

#### Authentication
- **Provider**: Supabase Auth.
- **Flow**:
  1. User enters email/password in `LoginForm.tsx`.
  2. `supabase.auth.signInWithPassword` called → Returns session token.
  3. Token stored in `localStorage` with expiration check.
  4. `useAuth.ts` hook manages auth state and refreshes tokens.
- **Sign-Up**: Admin creates users via `SignUpForm.tsx` → `supabase.auth.admin.createUser`.
- **Password Reset**: Email link via `supabase.auth.resetPasswordForEmail`.

#### Authorization
- **RBAC Implementation**:
  - `AuthLayout.tsx` checks `user.role` against route permissions:
    - `/users`: Admin only.
    - `/approvals`: Supervisor only.
    - `/transactions`: Clerk, Storeman, Supplier (limited).
  - Supabase RLS (Row-Level Security) policies:
    ```sql
    CREATE POLICY "Admins can manage users" ON users FOR ALL TO authenticated
    USING (auth.role() = 'admin');
    ```

---

### 8. Security Features

1. **Input Validation**:
   - Client-side: Zod schemas in forms.
   - Server-side: Supabase RLS and triggers validate data.
2. **CSRF Protection**:
   - Supabase handles via JWT tokens.
3. **Rate Limiting**:
   - Configure in Supabase dashboard for auth endpoints (e.g., 10 attempts/min).
4. **Encryption**:
   - Sensitive fields (e.g., `password_hash`) encrypted by Supabase Auth.
   - Documents in Supabase Storage encrypted at rest.
5. **Secure Headers**:
   - Add CSP, X-Frame-Options in `next.config.js`.
6. **Audit Logging**:
   - Log user actions (login, transaction approval) in a new `audit_logs` table.

---

### 9. Page/UI Design Description

#### General Design
- **Style**: Glassmorphic UI with semi-transparent backgrounds, blur effects, and soft shadows.
- **Colors**: Primary (#0A0A0A), Accent (#F5F5F5), Muted (#E5E5E5).
- **Typography**: Inter font, consistent spacing (Tailwind `leading-7`).

#### Pages
1. **Login (`/`)**
   - Centered card with email, password, role dropdown, and “Sign In” button.
   - Glassmorphic card with subtle hover effects.
2. **Dashboard (`/dashboard`)**
   - Summary cards (4-column grid) with icons and stats.
   - Tabs: Overview (charts), Approvals (list).
   - Real-time updates with fade-in animations.
3. **Inventory (`/inventory`)**
   - Table with filter inputs and sortable headers.
   - Context menu for transaction initiation.
4. **Transactions (`/transactions`)**
   - Tabbed interface for transaction types.
   - Modal forms with dynamic fields and document upload.
5. **Approvals (`/approvals`)**
   - Table with approve/reject buttons and status badges.
6. **Analytics (`/analytics`)**
   - Grid of Recharts visualizations (bar, pie, line).
7. **Calculator (`/calculator`)**
   - Two-column layout with input forms and result cards.

**Components**:
- **Button**: Rounded, hover scale effect.
- **Card**: Glassmorphic with blur and opacity.
- **Table**: Responsive with hover states and pagination.

---

These documents provide a roadmap to transform the current codebase into a robust, production-ready application. Let me know if you’d like deeper details on any section (e.g., specific code snippets or wireframes)!