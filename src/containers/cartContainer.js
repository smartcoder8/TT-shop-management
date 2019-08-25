import React from 'react'
import { Container, Subscribe, Provider } from 'unstated'

import { parseSession } from 'util/getPodSessions'

const ROOT_KEY = 'pingpod'
const CART_KEY = `${ROOT_KEY}/cart`

class CartContainer extends Container {
  state = {
    items: [],
    watchedPods: [],
  }

  get items() {
    return this.state.items || []
  }

  get locationIds() {
    const locations = []

    this.items.forEach(item => {
      const {
        locationId,
      } = parseSession(item)

      if (locations.indexOf(locationId) < 0) {
        locations.push(locationId)
      }
    })

    return locations
  }

  constructor() {
    super()

    let storedItems = []
    
    try {
      const storedString = localStorage.getItem(CART_KEY).trim()
      if (storedString) {
        storedItems = storedString.split(',')
      }
    } catch (err) {
      console.log(err)
    }

    this.state.items = storedItems
  }

  getDates = () => {
    const dates = {}

    this.items.forEach(item => {
      const {
        locationId,
        date,
      } = parseSession(item)

      dates[date] = dates[date] || { date, locationId }
      dates[date].sessions = dates[date].sessions || []
      dates[date].sessions.push(item)
    })

    return Object.values(dates)
  }


  isInCart = (sessionId) => {
    return this.items.indexOf(sessionId) > -1
  }

  addItem = (item) => {
    const items = [ ...this.state.items ]

    if (items.indexOf(item) > -1) {
      return
    }

    items.push(item)

    localStorage.setItem(CART_KEY, items.join(','))
    this.setState({ items })
  }

  removeItem = (item) => {
    const items = [ ...this.state.items ]
    const index = items.indexOf(item)

    if (index < 0) {
      return
    }

    items.splice(index, 1)
    localStorage.setItem(CART_KEY, JSON.stringify(items))
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