// These interfaces match the backend database models exactly.
// When the API returns data, TypeScript will know the shape of each object.

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  updated_at: string;
}

export interface Cupboard {
  id: number;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
  places?: Place[]; // included when API returns with relationships
}

export interface Place {
  id: number;
  cupboard_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  cupboard?: Cupboard;
  items?: Item[];
}

export interface Item {
  id: number;
  name: string;
  code: string;
  quantity: number;
  serial_number: string | null;
  image: string | null;
  description: string | null;
  place_id: number;
  status: "IN_STORE" | "BORROWED" | "DAMAGED" | "MISSING";
  created_at: string;
  updated_at: string;
  place?: Place;
}

export interface BorrowRecord {
  id: number;
  item_id: number;
  user_id: number;
  borrower_name: string;
  contact: string;
  quantity: number;
  borrow_date: string;
  expected_return_date: string;
  return_date: string | null;
  status: "BORROWED" | "RETURNED";
  created_at: string;
  updated_at: string;
  item?: Item;
  user?: User;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  table_name: string;
  record_id: number;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

// API response types
export interface LoginResponse {
  user: User;
  token: string;
}
