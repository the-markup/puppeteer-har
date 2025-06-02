import * as fs from 'fs';
import { harFromMessages } from "chrome-har"
import { Page } from "puppeteer"
import { Har } from "har-format"
import { observeEvents } from "./observeEvents"
import { captureResponses } from "./captureResponses"
import { promisify } from 'util';

const pageEventsToObserve = [
  "Page.loadEventFired",
  "Page.domContentEventFired",
  "Page.frameStartedLoading",
  "Page.frameAttached",
  "Page.frameScheduledNavigation",
]

const networkEventsToObserve = [
  "Network.requestWillBeSent",
  "Network.requestServedFromCache",
  "Network.dataReceived",
  "Network.responseReceived",
  "Network.resourceChangedPriority",
  "Network.loadingFinished",
  "Network.loadingFailed",
]

type CaptureOptions = {
  saveResponses?: boolean
  captureMimeTypes?: string[]
}

type StopFn = (output?: string) => Promise<any>

export async function captureNetwork(
  page: Page,
  {
    saveResponses = false,
    captureMimeTypes = ["text/html", "application/json"],
  }: CaptureOptions = {}
): Promise<StopFn> {
  const client = await page.target().createCDPSession()

  await client.send("Page.enable")
  await client.send("Network.enable")

  const stopPageEventCapturing = observeEvents(client, pageEventsToObserve)
  const stopNetworkEventCapturing = observeEvents(
    client,
    networkEventsToObserve
  )
  const stopRequestCapturing = captureResponses(client, {
    captureMimeTypes,
    saveResponses,
  })

  return async function getHar(output?:string): Promise<any> {
    const pageEvents = await stopPageEventCapturing()
    const networkEvents = await stopRequestCapturing(
      await stopNetworkEventCapturing()
    )

    await client.detach()

    const har = harFromMessages([...pageEvents, ...networkEvents], {
      includeTextFromResponseBody: saveResponses,
    })

    if (output) {
      await promisify(fs.writeFile)(output, JSON.stringify(har))
      return Promise.resolve()
    } else {
      return har
    }
  }
}
