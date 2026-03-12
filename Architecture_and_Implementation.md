# Architecture and Implementation Documentation

## 1. Architecture Decisions
The project is built using a decoupled **Frontend-Backend architecture** utilizing **React (TypeScript)** on the frontend and **Laravel (PHP)** on the backend.

### Key Architectural Choices:
- **API-Driven Communications**: The React frontend and Laravel backend communicate exclusively through RESTful JSON APIs. This separates concerns, allows for easier testing, and provides the flexibility to create mobile apps later using the same backend.
- **Service-Controller Pattern**: Business logic is intentionally placed within Laravel Controllers leveraging robust Eloquent Models. Database operations are encapsulated within transactions to maintain absolute data integrity.
- **Authentication**: Laravel Sanctum is used for token-based authentication, which is highly suited for SPA (Single Page Applications) like React.

---

## 2. Database Schema Justification
The database is strictly relational and normalized (at least to 3NF) to eliminate redundancies and maintain data dependencies.

- **`users` Table:** Stores all application users. We included a `role` field (e.g., admin, staff) to manage basic RBAC (Role-Based Access Control) without needing an overly complex permissions package.
- **`cupboards` and `places` Tables:** A one-to-many relationship where a cupboard contains multiple places. This hierarchical structure allows the physical physical location of items to be mapped precisely (e.g., "Cupboard A, Top Shelf").
- **`items` Table:** Represents the actual inventory. It uses a unique `code` constraint to prevent duplicate barcode or SKU entries. It directly references `place_id`.
- **`borrow_records` Table:** Represents a transactional ledger. Instead of just marking an item "borrowed", this table tracks *who* borrowed it, *when*, and contact info. It maintains a relationship with both `items` and `users`.
- **`audit_logs` Table:** Crucial for accountability. Instead of generic logging, we capture structured JSON updates (`old_value`, `new_value`) to provide full historical context for any updates or deletes.

---

## 3. Handling Race Conditions
In an inventory system, a classic race condition occurs when two users attempt to borrow the last available unit of an item at the exact same millisecond. If not handled, both might succeed, leading to a negative inventory quantity.

### Solution Implemented:
The application prevents data race conditions at the database level using a combination of **Database Transactions** and **Pessimistic Locking (`lockForUpdate()`)**.

**Example from `BorrowController` & `ItemController`:**
```php
$borrow = DB::transaction(function () use ($request) {
    // lockForUpdate() adds a "SELECT ... FOR UPDATE" lock to the row.
    // Any concurrent request trying to read this row will be forced to wait
    // until this transaction commits.
    $item = Item::lockForUpdate()->findOrFail($request->item_id);

    if ($item->quantity < $request->quantity) {
        abort(422, 'Not enough stock.');
    }

    $item->quantity -= $request->quantity;
    $item->save();
    
    // ... perform inserts to borrow_records and audit_logs
});
```
This guarantees that inventory validation and state modification are treated as a single, atomic operation.

---

## 4. Business Logic Walkthrough

### Borrowing an Item
1. **Request validation:** The system validates that the user sent a valid `item_id`, borrower details, and requested quantity.
2. **Transaction Start & Lock:** A database transaction is started. The requested `Item` is fetched and locked `lockForUpdate()`.
3. **Availability check:** The system checks if `$item->quantity >= $request->quantity`. If it fails, the transaction is aborted.
4. **State Update:** The item's quantity is decremented. If the remaining quantity reaches `0`, the item's `status` shifts entirely to `BORROWED`.
5. **Record Creation:** A new entry is created in `borrow_records` associating the item, the user processing the loan, and borrower details.
6. **Auditing:** An `audit_log` entry is created recording the old quantity and new quantity.
7. **Commit:** The transaction commits and returns the newly created record.

### Returning an Item
1. **Validation & Retrieval:** Validates the `borrow_id`. Starts a transaction, finds the specific `borrow_record` (must have 'borrowed' status), and then fetches the related `Item` with `lockForUpdate()`.
2. **State Reversal:** Adds the borrowed quantity back to `$item->quantity`.
3. **Active Status Check:** The system queries if the item has any *other* active `borrow_records`. If no other active borrows exist, it flips the item's status back to `IN_STORE`.
4. **Conclusion:** Marks the `borrow_record` as `RETURNED` with the current date, inserts an `audit_log`, and commits the transaction.

---

## 5. Implementation Assumptions
- **Staff Usage:** We assume this application is used by internal staff. Therefore, the system relies on the staff member inputting the borrower's name and contact, rather than the borrower creating an account themselves.
- **Partial Returns:** The current implementation assumes a borrower returns the exact quantity they borrowed in a single transaction. Complex partial returns require multiple ledger entries not currently covered.
- **Images:** Image files are stored locally in the `public/items` disk directory assuming standard unified server hosting.
