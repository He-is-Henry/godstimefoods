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
  images: OrderProductImage[];
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
  isPaid: boolean;
  totalAmount: number;
  deliveryAddress: string;
  confirmationCodeHash: string | null;
  confirmationAttempts: number;
  confirmationLockedUntil: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  phone: string | null;
  email: string;
};

type AdminOrder = Order & {
  customer: OrderCustomerSummary;
};
