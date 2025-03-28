# Transaction Workflow Management

## Overview

The `TransactionWorkflow` component provides a comprehensive, role-based multi-stage approval system for different transaction types in the StockFlowPro application.

## Transaction Types

1. **Receipt**
2. **Issuance**
3. **Transfer**
4. **Swap**

## Roles

- **Clerk**: Transaction initiator
- **Supplier Driver**: External approval for receipts
- **Storeman**: Inventory management and approval
- **Supervisor**: Final transaction approval
- **Supplier Supervisor**: External approval for swaps
- **Admin**: System-wide management

## Transaction Stages

1. **Draft**: Initial transaction creation
2. **Pending Clerk Submission**: Clerk prepares transaction
3. **Pending Supplier Driver Approval**: External driver review (Receipts)
4. **Pending Storeman Approval**: Storeman inventory verification
5. **Pending First Level Approval**: Initial internal review
6. **Pending Final Approval**: Final review and authorization
7. **Completed**: Transaction successfully processed
8. **Rejected**: Transaction halted

## Stage Progression Rules

- Each transaction type has a unique stage progression
- Roles have specific permissions for stage advancement
- Multi-step approval ensures accountability and accuracy

## Usage Example

```typescript
<TransactionWorkflow
  transactionType={TransactionType.Receipt}
  userRole={UserRole.Clerk}
  transactionData={receiptDetails}
  onStageChange={handleStageChange}
  onSubmit={submitTransactionToBackend}
/>
```

## Best Practices

- Validate transaction data before stage progression
- Implement comprehensive logging
- Ensure clear communication of stage transitions
- Maintain audit trail for each transaction
