import puppeteer from "puppeteer";
import { getSettings } from "../services/db_manager.js";

export async function getWeatherData() {
    let location = await getSettings().location;
    if (!location) {
        console.error("Location not found!");
        return false;
    }
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://obhavo.uz/${location}`, { waitUntil: "domcontentloaded" });

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
