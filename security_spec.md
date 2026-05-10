# Firebase Security Specification

## Data Invariants
1. Medicine: Must have a unique ID, valid pricing, and stock quantity >= 0.
2. Customer: Must have a name and mobile. `dueBalance` must be a number.
3. Sale: Must reference valid medicines (checked by app, but rules ensure data integrity). `total` must be equal to sum of items.
4. Transaction: Each transaction must reference a valid customer.
5. Immutability: `createdAt` and `id` should not change after creation.

## The Dirty Dozen (Potential Attacks to Block)
1. Unauthorized collection reading (blocking blanket reads).
2. Forging sales with zero total price.
3. Modifying a sale after it's been recorded.
4. Setting a negative stock in Medicine.
5. Modifying another user's profile/data (if I add auth, for now it's single admin/staff).
6. Deleting critical sales history.
7. Injecting huge strings into medicine names.
8. Bypassing state logic (e.g. paying less but recording full payment).
9. Spoofing `createdAt` dates.
10. Creating a transaction for a non-existent customer.
11. Reading the entire customers list without a proper query.
12. Updating `id` field of any document.

## The Test Runner
(Tests will be handled conceptually, we ensure rules block these.)
