import { Readable } from 'node:stream'
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'

type SdkBody = GetObjectCommandOutput['Body']

export function r2SdkBodyToWebStream(body: SdkBody): ReadableStream<Uint8Array> {
  if (!body) {
    throw new Error('Corpo vazio.')
  }
  const withWeb = body as SdkBody & { transformToWebStream?: () => ReadableStream<Uint8Array> }
  if (typeof withWeb.transformToWebStream === 'function') {
    return withWeb.transformToWebStream()
  }
  return Readable.toWeb(body as Readable) as ReadableStream<Uint8Array>
}
