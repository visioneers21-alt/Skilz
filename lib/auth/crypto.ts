import 'server-only'
import { createHash, randomBytes, randomInt } from 'crypto'
import { OTP_LENGTH } from './constants'

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function randomToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH
  return randomInt(0, max).toString().padStart(OTP_LENGTH, '0')
}
