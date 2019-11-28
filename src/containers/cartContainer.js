import React from 'react'
import { Container, Subscribe, Provider } from 'unstated'

import parseSessionId from 'util/parseSessionId'
import getSessionRate from 'util/getSessionRate'

const ROOT_KEY = 'pingpod'
const CART_KEY = `${ROOT_KEY}/cart`

class CartContainer extends Container {
  state = {
    items: [],
  }

  get items() {
    return this.state.items || []
  }

  get totalPrice() {
    let sum = 0

    this.items.forEach(sessionId => {
      const rate = getSessionRate(sessionId)
      sum += rate.MEMBER
    })

    return sum
  }

  get totalTime() {
    return this.items.length / 2
  }

  constructor() {
    super()

    let storedItems = []

    try {
      const cookie = localStorage.getItem(CART_KEY) || ''
      const storedString = cookie.trim()
      if (storedString) {
        storedItems = storedString.split(',')
      }
    } catch (err) {
      console.log(err)
    }

    this.state.items = storedItems

    this.poll()
  }

  poll = () => {
    setInterval(this.clean, 3000)
  }

  clean = () => {
    const oldItems = this.items

    const newItems = oldItems.filter(sessionId => {
      const { time } = parseSessionId(sessionId)
      const isPast = time < Date.now()
      return !isPast
    })

    if (newItems.length === oldItems.length) return

    this.setState({ items: newItems })
  }

  empty = () => {
    this.setState({ items: [] })
    localStorage.setItem(CART_KEY, '')
  }

  isInCart = (sessionId) => {
    return this.items.indexOf(sessionId) > -1
  }

  addItem = (item) => {
    const items = [...this.state.items]

    if (items.indexOf(item) > -1) {
      return
    }

    items.push(item)

    localStorage.setItem(CART_KEY, items.join(','))
    this.setState({ items })
  }

  removeItem = (item) => {
    const items = [...this.state.items]
    const index = items.indexOf(item)

    if (index < 0) {
      return
    }

    items.splice(index, 1)
    localStorage.setItem(CART_KEY, items.join(','))
    this.setState({ items })
  }
}

const cartContainer = new CartContainer()

export default cartContainer

export const CartSubscriber = ({ children }) => (
  <Provider>
    <Subscribe to={[cartContainer]}>
      {children}
    </Subscribe>
  </Provider>
)