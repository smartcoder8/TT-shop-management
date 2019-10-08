import React, { useState } from 'react'
import { withRouter, Link } from 'react-router-dom'
import qs from 'qs'

import cartContainer from 'containers/cartContainer'
import Layout from 'components/Layout'
import Sessions from 'components/Sessions'
import { ScheduleSession } from 'components/Session'
import Modal from 'components/Modal'
import { formatDate } from 'util/getPodSessions'
import getDateParts from 'shared/getDateParts'

import styles from './styles.scss'
import { CartSubscriber } from 'containers/cartContainer';
import ArrowLeft from 'components/svg/ArrowLeft';
import ArrowRight from 'components/svg/ArrowRight';

import RATES from 'shared/sessionRates'
import { RateLabel } from 'components/Session';

const TableRates = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Modal isActive={showModal} onClose={() => setShowModal(false)}>
        <div data-row>
          <div data-col="1"/>
          <div data-col="10">
            <h3>Table Rates</h3>
            <p data-p2>(price per 30-minute session)</p>
            <br />
            <br />

            {Object.values(RATES).map((rate, i) => {
              return (
                <div key={i} className={styles.tableRate}>
                  <RateLabel rate={rate} showEmpty />
                  <div>${rate.price.NON_MEMBER / 2}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div data-col="1"/>
      </Modal>
      <button className={styles.tableRates} data-link onClick={() => setShowModal(true)}>
        Table Rates
      </button>
    </>
  )
}

class PodSchedule extends React.Component {
  state = {
    date: new Date(),
    sessions: [],
  }

  sessionsRef = React.createRef()
  scrollToRef = React.createRef()

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { location } = this.props
    const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true })
    if (queryParams.time) {
      const time = parseInt(queryParams.time)
      this.setState({ date: new Date(time) })
    }
  }

  scrollToSession = () => {
    const sessionsEl = this.sessionsRef.current
    const scrollToEl = this.scrollToRef.current

    if (scrollToEl) {
      sessionsEl.scrollTop = scrollToEl.offsetTop
    }
  }

  prevDay = () => {
    const current = this.state.date
    const date = new Date(current)
    date.setDate(date.getDate() - 1)
    this.setDate(date)
  }

  nextDay = () => {
    const current = this.state.date
    const date = new Date(current)
    date.setDate(date.getDate() + 1)
    this.setDate(date)
  }

  setDate = (date) => {
    const today = new Date()
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    if (date.getTime() < today.getTime()) {
      return
    }

    this.setState({ date })
  }

  render() {
    const { date } = this.state
    const { params } = this.props.match
    const locationId = params.locationId

    const {
      dayOfTheWeek,
      month,
      day
    } = getDateParts(date)

    const dateToScroll = new Date(date)
    dateToScroll.setMinutes(0)
    dateToScroll.setSeconds(0)
    dateToScroll.setMilliseconds(0)
    const timeToScroll = dateToScroll.getTime()

    const today = new Date()
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    const isToday = today.getTime() === dateToScroll.getTime()

    return (
      <Layout className={styles.podSchedule}>
        <div data-row>
          <div data-col="2" className={styles.prevDay} onClick={this.prevDay} data-active={!isToday}>
            <ArrowLeft />
          </div>
          <div data-col="8" className={styles.today}>
            <p data-label>{dayOfTheWeek}</p>
            <h1>{month} {day}</h1>
          </div>
          <div data-col="2" className={styles.nextDay} onClick={this.nextDay}>
            <ArrowRight />
          </div>
        </div>

        <CartSubscriber>{() => (
          <>
            <div className={styles.sessions} data-row ref={this.sessionsRef}>
              <Sessions 
                date={formatDate(date)} 
                locationId={locationId}
                onFirstLoad={this.scrollToSession}
              >{(sessions) => {
                const availableSessions = sessions.filter(({ isAvailable }) => isAvailable) 
                if (sessions.length && !availableSessions.length) {
                  return 'No sessions available for this day.'
                }
                
                return (
                  availableSessions.map(({ id, time, isAvailable, isPast, rate }) => {
                    const isSelected = cartContainer.isInCart(id)

                    const toggleSelect = () => {
                      if (isSelected) cartContainer.removeItem(id)
                      else cartContainer.addItem(id)
                    }

                    const scrollToRef = timeToScroll === time ? this.scrollToRef : null

                    if (isPast) return null

                    return (
                      <div key={id} ref={scrollToRef}>
                        <ScheduleSession
                          id={id}
                          isAvailable={isAvailable}
                          isPast={isPast}
                          isSelected={isSelected}
                          key={id} 
                          onClick={toggleSelect}
                          rate={rate}
                        />
                      </div>
                    )
                  })
                )
              }}</Sessions>
            </div>
            <div data-row className={styles.checkout}>
              <Link to="/cart" data-col="12">
                <button disabled={!cartContainer.items.length}>
                  Reserve Selected Times ({cartContainer.items.length})
                </button>
              </Link>
            </div>
            <br />
            <TableRates />
          </>
        )}</CartSubscriber>

      </Layout>
    )
  }
}

export default withRouter(PodSchedule)