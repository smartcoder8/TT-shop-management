import React from 'react'
import firebase from 'firebase/app'
import { getSessions } from 'util/getPodSessions'

const db = firebase.firestore()

const DEFAULT_POD_ID = '0'

class Sessions extends React.Component {
  state = {
    sessions: []
  }

  componentDidMount() {
    this.setSessions()
  }

  componentDidUpdate(prevProps) {
    if (this.props.date === prevProps.date) {
      return
    }

    this.setSessions()
  }

  componentWillUnmount() {
    this.isUnmounted = true
  }

  setSessions = () => {
    const { date, locationId } = this.props

    return db.collection('pods')
    .doc(locationId || DEFAULT_POD_ID)
    .onSnapshot(doc => {
      if (!doc.exists) {
        console.log('Location does not exist at id:', locationId)
        return
      }

      if (this.isUnmounted) {
        return
      }
      
      const sessions = getSessions(doc, date, locationId)
      this.setState({ sessions })
    })
  }

  render() {
    return this.props.children(this.state.sessions)
  }
}

export default Sessions