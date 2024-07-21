const knex = require("../database/knex")

class OrdersController {
  async create(request, response) {
    const { cart, orderStatus, totalPrice, paymentMethod } = request.body
    const user_id = request.user.id

    try {
      await knex.transaction(async trx => {
        const [order_id] = await trx("orders").insert({
          orderStatus,
          totalPrice,
          paymentMethod,
          user_id,
        })

        const itemsInsert = cart.map(item => ({
          title: item.title,
          quantity: item.quantity,
          dish_id: item.id,
          order_id,
        }))

        await trx("ordersItems").insert(itemsInsert)
      })

      return response.status(201).json({ message: "Order created successfully" })
    } catch (error) {
      console.error("Order creation error:", error)
      return response.status(500).json({ message: "Internal server error" })
    }
  }

  async index(request, response) {
    const user_id = request.user.id

    try {
      const user = await knex("users").where({ id: user_id }).first()

      const ordersQuery = knex("ordersItems")
        .innerJoin("orders", "orders.id", "ordersItems.order_id")
        .groupBy("orders.id")
        .select([
          "orders.id",
          "orders.user_id",
          "orders.orderStatus",
          "orders.totalPrice",
          "orders.paymentMethod",
          "orders.created_at",
        ])

      if (!user.isAdmin) {
        ordersQuery.where({ user_id })
      }

      const orders = await ordersQuery
      const ordersItems = await knex("ordersItems")

      const ordersWithItems = orders.map(order => {
        const orderItem = ordersItems.filter(item => item.order_id === order.id)
        return { ...order, items: orderItem }
      })

      return response.status(200).json(ordersWithItems)
    } catch (error) {
      console.error("Order retrieval error:", error)
      return response.status(500).json({ message: "Internal server error" })
    }
  }

  async update(request, response) {
    const { id, orderStatus } = request.body

    try {
      await knex("orders").update({ orderStatus }).where({ id })
      return response.status(200).json({ message: "Order updated successfully" })
    } catch (error) {
      console.error("Order update error:", error)
      return response.status(500).json({ message: "Internal server error" })
    }
  }
}

module.exports = OrdersController