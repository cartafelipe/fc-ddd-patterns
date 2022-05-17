import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it('should update an order', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1234", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("1234", "Product 1", 10);
    await productRepository.create(product);


    const orderItem = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    );
    const order = new Order("1234", "1234", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModelFromDb = await OrderModel.findOne(
      {
        where: { id: order.id },
        include: [{ model: OrderItemModel }]
      }
    );

    const orderItemsFromDb = orderModelFromDb.items.map((item) => {
      return new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      );
    });

    const orderFromDb = new Order(
      orderModelFromDb.id,
      orderModelFromDb.customer_id,
      orderItemsFromDb
    );

    const newQuantity = 2;
    orderFromDb.changeItemQuantity(orderItem, newQuantity);

    await orderRepository.update(orderFromDb);

    const orderModelUpdatedFromDb = await OrderModel.findOne({
      where: { id: order.id },
      include: [{ model: OrderItemModel }]
    });

    expect(orderModelUpdatedFromDb.toJSON()).toStrictEqual({
      id: "1234",
      customer_id: "1234",
      total: orderFromDb.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: newQuantity,
          order_id: "1234",
          product_id: "1234",
        },
      ],
    });

  });

  it("should find an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("12345", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("12345", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );
    const order = new Order("12345", "12345", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderFromDb = await orderRepository.find(order.id);

    expect(order).toStrictEqual(orderFromDb);

  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("12345", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("12345", "Product 1", 10);
    await productRepository.create(product);

    const orderItem1 = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );
    const orderItem2 = new OrderItem(
      "4",
      product.name,
      product.price,
      product.id,
      1
    );
    const order = new Order("12345", "12345", [orderItem1]);
    const order2 = new Order("123456", "12345", [orderItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);
    await orderRepository.create(order2);

    const allOrders = await orderRepository.findAll();

    expect(2).toEqual(allOrders.length);
  });
});