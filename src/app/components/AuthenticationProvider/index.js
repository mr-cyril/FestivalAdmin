import React, { useContext, useState, useEffect } from 'react'

import faker from 'faker'
import jwt from 'jsonwebtoken'

import useAuthLogin from 'app/hooks/useAuthLogin'
import useAuthSignup from 'app/hooks/useAuthSignup'

import rsaPublicKey from 'root/.rsa.pub'

const Authentication = React.createContext()

export const useAuthentication = () => useContext(Authentication)

export const AuthenticationProvider = ({
  children,
  redirect_url = '/',
  history = window.history,
}) => {

  const [ user, setUser ] = useState(null)
  const login = useAuthLogin()
  const signup = useAuthSignup()

  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()

  const authenticateFromToken = (token, appState) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        rsaPublicKey,
        { algorithm: 'RS256' },
        (err, decoded) => {
          if (err) return reject(err)
          window.localStorage.setItem('auth_token', token)
          resolve(decoded)
        }
      )
    })
    .then(user => {
      console.log('user', user);
      setUser(user)
    })
    .then(() => {
      if (appState && appState.from) {
        history.push(appState.from, appState)
      }
    })
    .catch(error => {
      throw new Error('Decryption Failure')
    })
  }

  useEffect(() => {
    // validate token on first render
    const token = window.localStorage.getItem('auth_token')
    if (token) {
      authenticateFromToken(token)
      .catch(() => {
        window.localStorage.removeItem('auth_token')
        console.log('token expired, redirect to', redirect_url);
      })
    }
  }, [])

  useEffect(() => {
    // validate users expiry date on each render
    if (user && user.exp*1000 < Date.now()) {
      setUser(null)
    }
  })

  const handleLogin = (email, password, appState) => {
    return login(email, password).then(token => authenticateFromToken(token, appState))
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('auth_token')
  }

  const handleSignup = (email, password, confirmPassword, appState) => {
    return signup(email,password,confirmPassword).then(token => authenticateFromToken(token, appState))
  }

  const context = {
    isAuthenticated: !!user,
    user,
    login: handleLogin,
    logout: handleLogout,
    signup: handleSignup
  }

  return (
    <Authentication.Provider value={context}>
      {children}
    </Authentication.Provider>
  )
}

export default AuthenticationProvider
