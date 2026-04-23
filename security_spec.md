# Security Specification - Aide Urgente Sud-Kivu

## Data Invariants
1. A help request must have a valid `userId` matching the creator's UID.
2. A request cannot be marked as `in_progress` or `resolved` without a `volunteerId` (if applicable).
3. Users can only edit their own profile.
4. Timestamps must be server-generated.

## The Dirty Dozen Payloads (Rejections)
1. **Identity Spoof**: User A trying to create a request with `userId: User_B`.
2. **Ghost Field**: Adding `isAdmin: true` to a user profile.
3. **Privilege Escalation**: User A trying to delete User B's request.
4. **Invalid Type**: Setting `status` to `true` (boolean instead of string).
5. **ID Poisoning**: Using a 2KB string for a `requestId`.
6. **State Shortcut**: Marking a request as `resolved` while it's still `open` without the owner's consent or volunteer assignment.
7. **Malformed Category**: Using `category: "party"`.
8. **Resource Exhaustion**: Sending a 1MB `description`.
9. **Unverified Write**: Writing to `users/` without being authenticated.
10. **Immortality Breach**: Trying to change `createdAt` on an existing request.
11. **Orphaned Write**: Creating a request with a non-existent category.
12. **Query Scraping**: Attempting to list all users' phone numbers without permission.

## Firestore Rules Test Runner Plan
Using `@firebase/rules-unit-testing` logic (conceptual).
- `test('should deny unauthenticated write')`
- `test('should allow user to create their own request')`
- `test('should deny user editing others request')`
