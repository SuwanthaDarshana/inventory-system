# Inventory System Database Schema Design

This document outlines the database tables, fields, and relationships for the Inventory Management System. The database relies on standard relational structures with foreign key constraints to maintain data integrity.

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at "nullable"
        string password
        string remember_token "nullable"
        string role "default: staff"
        timestamps created_at,updated_at
    }

    CUPBOARDS {
        bigint id PK
        string name
        string location "nullable"
        timestamps created_at,updated_at
    }

    PLACES {
        bigint id PK
        bigint cupboard_id FK
        string name
        timestamps created_at,updated_at
    }

    ITEMS {
        bigint id PK
        string name
        string code UK
        integer quantity
        string serial_number "nullable"
        string image "nullable"
        text description "nullable"
        bigint place_id FK
        string status "default: IN_STORE"
        timestamps created_at,updated_at
    }

    BORROW_RECORDS {
        bigint id PK
        bigint item_id FK
        bigint user_id FK "nullable"
        string borrower_name
        string contact
        date borrow_date
        date expected_return_date
        date return_date "nullable"
        integer quantity
        string status
        timestamps created_at,updated_at
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK
        string action
        string table_name
        integer record_id
        json old_value "nullable"
        json new_value "nullable"
        timestamps created_at,updated_at
    }

    CUPBOARDS ||--o{ PLACES : "has"
    PLACES ||--o{ ITEMS : "contains"
    ITEMS ||--o{ BORROW_RECORDS : "can have multiple"
    USERS ||--o{ BORROW_RECORDS : "manages"
    USERS ||--o{ AUDIT_LOGS : "performs"
```

## Tables Details

### 1. `users`
**Purpose**: Stores authentication and profile data for admins and staff members.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `name` | `string` | |
| `email` | `string` | Unique |
| `password` | `string` | Hashed |
| `role` | `string` | Default: `staff` |
| `created_at` / `updated_at` | `timestamps` | |

### 2. `cupboards`
**Purpose**: Represents main physical storage cabinets or units.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `name` | `string` | |
| `location` | `string` | Nullable |
| `created_at` / `updated_at` | `timestamps` | |

### 3. `places`
**Purpose**: Refers to specific locations, shelves, or compartments within a cupboard.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `cupboard_id` | `bigint` | Foreign Key (`cupboards`.`id`), Cascade Delete |
| `name` | `string` | |
| `created_at` / `updated_at` | `timestamps` | |

### 4. `items`
**Purpose**: Stores inventory items logic. Always tied to a specific `place`.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `name` | `string` | |
| `code` | `string` | Unique |
| `quantity` | `integer` | |
| `serial_number` | `string` | Nullable |
| `image` | `string` | Nullable image path |
| `description` | `text` | Nullable |
| `place_id` | `bigint` | Foreign Key (`places`.`id`) |
| `status` | `string` | Default: `IN_STORE` |
| `created_at` / `updated_at` | `timestamps` | |

### 5. `borrow_records`
**Purpose**: Manages lending out items from inventory.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `item_id` | `bigint` | Foreign Key (`items`.`id`) |
| `user_id` | `bigint` | Foreign Key (`users`.`id`), Nullable |
| `borrower_name` | `string` | |
| `contact` | `string` | Phone/Email |
| `borrow_date` | `date` | |
| `expected_return_date`| `date` | |
| `return_date` | `date` | Nullable |
| `quantity` | `integer` | |
| `status` | `string` | e.g. 'borrowed', 'returned' |
| `created_at` / `updated_at` | `timestamps` | |

### 6. `audit_logs`
**Purpose**: Keeps track of actions performed by logged-in users on database records to ensure traceability.
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment |
| `user_id` | `bigint` | Foreign Key (`users`.`id`) |
| `action` | `string` | e.g. 'created', 'updated', 'deleted'|
| `table_name` | `string` | Name of the table affected ||
| `record_id` | `integer` | ID of the updated record |
| `old_value` | `json` | Nullable, state before update |
| `new_value` | `json` | Nullable, state after update |
| `created_at` / `updated_at` | `timestamps` | |
