import { createError as _createError, H3Error } from 'h3'
import { useNuxtApp, useState } from '#app'

export const useError = () => {
  const nuxtApp = useNuxtApp()
  return useState('error', () => process.server ? nuxtApp.ssrContext.error : nuxtApp.payload.error)
}

export interface NuxtError extends H3Error {}

export const throwError = (_err: string | Error | Partial<NuxtError>) => {
  const nuxtApp = useNuxtApp()
  const error = useError()
  const err = typeof _err === 'string' ? new Error(_err) : createError(_err)
  nuxtApp.callHook('app:error', err)
  if (process.server) {
    nuxtApp.ssrContext.error = nuxtApp.ssrContext.error || err
  } else {
    error.value = error.value || err
  }

  return err
}

export const clearError = async (options: { redirect?: string } = {}) => {
  const nuxtApp = useNuxtApp()
  const error = useError()
  nuxtApp.callHook('app:error:cleared', options)
  if (options.redirect) {
    await nuxtApp.$router.replace(options.redirect)
  }
  error.value = null
}

const isNuxtError = (err: object): err is NuxtError => err && typeof err === 'object' && ('__nuxt_error' in err)

export const createError = (err: Partial<NuxtError>): NuxtError => {
  return isNuxtError(err) ? err : _createError(err)
}
