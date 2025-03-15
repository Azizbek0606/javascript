import puppeteer from "puppeteer";

export async function getWeatherData() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://obhavo.uz/tashkent", { waitUntil: "domcontentloaded" });

    const data = await page.evaluate(() => {
        const forecastEl = document.querySelector(".current-forecast");
        const detailsEl = document.querySelector(".current-forecast-details");

        const sunriseText = detailsEl?.querySelectorAll("p")[4]?.textContent || "";
        const sunsetText = detailsEl?.querySelectorAll("p")[5]?.textContent || "";

        return {
            imageSrc: forecastEl?.querySelector("img")?.src || null,
            currentTemp: forecastEl?.querySelector("strong")?.textContent.trim() || null,
            nightTemp: forecastEl?.querySelectorAll("span")[2]?.textContent.trim() || null,
            sunrise: sunriseText.includes(": ") ? sunriseText.split(": ")[1].trim() : null,
            sunset: sunsetText.includes(": ") ? sunsetText.split(": ")[1].trim() : null
        };
    });

    await browser.close();
    return data;
}
