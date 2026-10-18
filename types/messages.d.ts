interface Message {
  id: number;
  userId: number;
  action:
    | "ORDER_CONFIRMED"
    | "ORDER_CANCELLED"
    | "ORDER_OUT_FOR_DELIVERY"
    | "ORDER_DELIVERED"
    | "ORDER_REVIVED"
    | "PAYMENT_VERIFIED";

  orderId: number;
  order: Order;
  read: boolean;
}
