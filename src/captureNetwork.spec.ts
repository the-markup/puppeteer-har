import puppeteer, { Browser } from "puppeteer"
import { captureNetwork } from "./captureNetwork"

// TODO: something's going on here where the first execution
// doesn't terminate and Jest gets mad
// probably has to do with the way 'browser' is created/closed

const defaultPuppeteerBrowserOptions = {
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'],
    defaultViewport: null,
    headless: true
};
describe("captureNetwork", () => {
  let browser: Browser | void

  const getBrowser = async () => {
    if (browser == null) {
      browser = await puppeteer.launch(defaultPuppeteerBrowserOptions)
    }

    return browser
  }

  const getPage = async () => await (await getBrowser()).newPage()

  afterAll(async () => {
    await (await getBrowser()).close()
  })

  it("should be possible to capture html contents.", async () => {
    const page = await getPage()

    const getHar = await captureNetwork(page, { saveResponses: true })

    await page.goto("https://www.google.com")

    const har = await getHar()

    const entry = har.log.entries.find(({ request }) => {
      return (
        request.method === "GET" && request.url === "https://www.google.com/"
      )
    })

    expect(entry?.response.content).not.toHaveProperty("text", undefined)
  })
})
