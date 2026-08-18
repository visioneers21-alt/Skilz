'use client'

import { useCallback } from 'react'
import { AuthRequiredError } from '@/lib/auth/errors'
import { useAuth } from '@/lib/auth/auth-context'

export function useHandleAuthRequired() {
  const { openAuthModal, refreshSession } = useAuth()

  return useCallback(
    async (err: unknown, fallbackMessage: string): Promise<string> => {
      if (err instanceof AuthRequiredError) {
        await refreshSession()
        openAuthModal()
        return 'Create an account to see your results and continue.'
      }
      return fallbackMessage
    },
    [openAuthModal, refreshSession],
  )
}
