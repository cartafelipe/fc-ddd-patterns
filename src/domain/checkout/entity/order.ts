import OrderItem from "./order_item";
export default class Order {

  private _id: string;
  private _customerId: string;
  private _items: OrderItem[];
  private _total: number;

  constructor(id: string, customerId: string, items: OrderItem[]) {
    this._id = id;
    this._customerId = customerId;
    this._items = items;
    this._total = this.total();
    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return this._items;
  }

  validate(): boolean {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._customerId.length === 0) {
      throw new Error("CustomerId is required");
    }
    if (this._items.length === 0) {
      throw new Error("Items are required");
    }

    if (this._items.some((item) => item.quantity <= 0)) {
      throw new Error("Quantity must be greater than 0");
    }

    return true;
  }

  total(): number {
    return this._items.reduce((acc, item) => acc + item.totalPrice(), 0);
  }

  private _findOrderItemById(id: string): OrderItem {
    var orderItem = this._items.find((i) => i.id === id);
    if (orderItem) {
      return orderItem;
    } else {
      throw new Error("Order item not found.");
    }
  }

  changeItemQuantity(orderItem: OrderItem, newQuantity: number) {
    const orderItemFromThisOrder = this._findOrderItemById(orderItem.id);
    if (newQuantity > 0) {
      const orderWithNewQuantity = new OrderItem(
        orderItem.id,
        orderItem.name,
        orderItem.price,
        orderItem.productId,
        newQuantity
      );
      const itemIndex = this._items.indexOf(orderItemFromThisOrder);
      this._items[itemIndex] = orderWithNewQuantity;
    }
    this.validate();
  }
}
