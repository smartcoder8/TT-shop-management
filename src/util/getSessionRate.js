import parseSessionId from 'util/parseSessionId'
import getReservationCost from '../../shared/getReservationCost'

const getSessionRate = (sessionId) => {
  const { time, locationId } = parseSessionId(sessionId)
  return getReservationCost({ reservationTime: time, locationId })
}

export default getSessionRate
