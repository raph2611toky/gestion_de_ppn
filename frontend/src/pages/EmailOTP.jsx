'use client';

import React, { useState, useEffect } from 'react'
import AccountVerificationSuccess from './AccountVerificationSuccess'
import api from '../utils/api'
import '../styles/login.css'

function EmailOTP({ email, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && (isLoading || resendLoading)) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, isLoading, resendLoading])

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Veuillez entrer un code OTP valide')
      return
    }

    setIsLoading(true)
    console.log('[v0] OTP verification started with code:', otpCode)
    
    setTimeout(async () => {
      try {
        const response = await api.post("/verify-otp", { email, code_otp: otpCode })
        console.log('[v0] API response:', response)
        if (response?.status === 200) {
          setIsVerified(true)
          console.log('[v0] Verification successful')
        } else {
          setError('Code OTP invalide. Veuillez réessayer.')
        }
      } catch (err) {
        console.log('[v0] Verification error:', err.message)
        setError('Une erreur est survenue lors de la vérification')
      } finally {
        setIsLoading(false)
      }
    }, 500)
  }

  const handleResend = () => {
    setResendLoading(true)
    setError('')
    setCountdown(60)

    setTimeout(() => {
      setOtp(['', '', '', '', '', ''])
      setResendLoading(false)
    }, 500)
  }

  if (isVerified) {
    return <AccountVerificationSuccess email={email} />
  }

  return (
    <div className="login-container">
      <div className="login-card otp-card">
        <div className="login-header-simple">
          <h1 className="login-title-simple">Verification OTP</h1>
          <p className="login-subtitle-simple">Entrez le code envoye a votre email</p>
        </div>

        <div className="otp-email-display">
          <p className="otp-email-text">Code envoye a: <strong>{email}</strong></p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="otp-inputs-container">
            {otp.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                placeholder="0"
              />
            ))}
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Verification...
              </>
            ) : (
              'Verifier le code'
            )}
          </button>
        </form>

        <div className="otp-footer">
          <p className="otp-footer-text">
            Vous n'avez pas recu le code ?{' '}
            <button
              className="otp-footer-link"
              onClick={handleResend}
              disabled={!canResend || resendLoading}
            >
              {canResend && countdown === 0 ? 'Renvoyer le code' : `Renvoyer dans ${countdown}s`}
            </button>
          </p>
          <p className="otp-back-text">
            <button className="otp-back-link" onClick={onBack}>
              Retour
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailOTP
