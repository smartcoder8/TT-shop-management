import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import qs from 'qs'

import EmailField from 'components/fields/EmailField'
import PasswordField from 'components/fields/PasswordField'
import Layout from 'components/Layout'

import styles from './styles.scss'
import authContainer from '../../containers/authContainer';
import ResetPassword from './ResetPassword';

const LoginForm = ({ onSubmit }) => (
  <Form
    onSubmit={onSubmit}
    render={({ handleSubmit, values, ...rest }) => (
      <div data-row>
        <form onSubmit={handleSubmit} data-col="12">
          <div data-field-row>
            <EmailField name="email" label="Email" autoComplete="email" />
          </div>
          <div data-field-row>
            <PasswordField name="password" label="Password" autoComplete="current-password" />
          </div>
          <ResetPassword email={values.email}>
            <span className={styles.reset}>Reset Password</span>
          </ResetPassword>
          <button type="submit">Submit</button>
        </form>
      </div>
    )}
  />
)

class Login extends React.Component {
  state = {
    newUser: false,
    submissionError: ''
  }

  getRedirect = () => {
    const { location } = this.props

    const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true })
    return queryParams.redirect || '/account'
  }

  login = (data = {}) => {
    const { email, password } = data

    authContainer.login({ email, password })
      .then(() => {
        this.followRedirect()
      })
      .catch((err) => {
        this.setState({ submissionError: err })
      })
  }

  followRedirect = () => {
    const { history } = this.props
    const redirect = this.getRedirect()
    history.push(redirect)
  }

  render() {
    const { submissionError } = this.state

    return (
      <Layout className={styles.transactionFeed}>
        {submissionError && (
          <span>
            {submissionError.toString()}
          </span>
        )}
        <div data-row>
          <div>
            <h1>Login</h1>

            <LoginForm onSubmit={this.login} />

            <p data-label>First time visitor?</p>
            <Link to={`/sign-up?redirect=${this.getRedirect()}`} data-link>
              Sign Up
            </Link>
          </div>
        </div>
      </Layout>
    )
  }
}

export default withRouter(Login)
