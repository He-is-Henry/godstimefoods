type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type OrderProductImage = {
  path: string;
  url: string;
};

type OrderProductSummary = {
  name: string;
  description: string | null;
  images: OrderProductImage[] | { item: OrderProductImage[] };
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product: OrderProductSummary;
};

type Order = {
  id: number;
  customerId: number;
  status: OrderStatus;
  paid: "UNPAID" | "PENDING_VERIFICATION" | "VERIFIED";
  totalAmount: number;
  deliveryAddress: string;
  confirmationCodeHash: string | null;
  confirmationAttempts: number;
  confirmationLockedUntil: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedById: number | null;
  deliveredById: number | null;
  cancelledById: number | null;
  paidById: number | null;
  assignedToId: number | null;
  items: OrderItem[];
};

type CreateOrderPayload = {
  addressId: number;
  productId?: number;
  quantity?: number;
};

type OrderCustomerSummary = {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email: string;
};

type OrderManagementSummary = OrderCustomerSummary | null;

type AdminOrder = Order & {
  customer: OrderCustomerSummary;
  confirmedBy: OrderManagementSummary;
  deliveredBy: OrderManagementSummary;
  cancelledBy: OrderManagementSummary;
  paidBy: OrderManagementSummary;
  assignedTo: OrderManagementSummary;
};
