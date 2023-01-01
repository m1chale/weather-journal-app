/** Javascript for Website handling
 * @module website/app
 */

/**
 * ****************************************************
 * Define Global Variables
 */

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth() + "." + d.getDate() + "." + d.getFullYear();
/**
 * End Global Variables
 *
 * ****************************************************
 * Start Helper Functions
 */

/**
 * Request weatherData from openWeather
 * @param {string} zip Zip code from city from which the weatherData will be requested
 * @returns {number} current temperature of requested zip-code
 */
async function getTemperature(zip) {
  const apiKey = "db7811a11f14f1bbd299d6a48790f2fb";
  const units = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${zip}&units=${units}&appid=${apiKey}`;

  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const weatherData = await apiRes.json();
      if (weatherData) return weatherData.main.temp;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);

    //@TODO
    //show user what happend wrong
    //remove loading spinner
    //show "try again" option
    //background send details to error tracing service
  }
}

/**
 * Uploads the weather data to the server
 * @param {object} weatherData
 * @returns {boolean} true if upload finished without error
 */
async function uploadWeatherData(weatherData) {
  try {
    const apiRes = await fetch("/api/weather-records", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      // Body data type must match "Content-Type" header
      body: JSON.stringify(weatherData),
    });
    if (apiRes?.ok) {
      const apiResWeatherData = await apiRes.json();

      if (apiResWeatherData) return true;
    } else
      throw new Error(
        `HTTP Code: ${apiRes?.status} \n Error-Message: ${await apiRes.text()}`
      );
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * Gets the weather history data from the server
 * @returns {Array<object>} weather history
 */
async function getWeatherHistoryData() {
  const url = "/api/weather-records";

  try {
    const apiRes = await fetch(url);

    if (apiRes?.ok) {
      const weatherHistory = await apiRes.json();
      if (weatherHistory) return weatherHistory;
    } else throw new Error(`HTTP Code: ${apiRes?.status}`);
  } catch (error) {
    console.log("There was an error", error);
  }
}

/**
 * End Helper Functions
 *
 * ****************************************************
 * Begin Main Functions
 */

/**
 * initializing
 * @param {Event} event
 */
function documentLoaded(event) {
  const generate = document.getElementById("generate");
  generate.addEventListener("click", generateOnClick);
}

/**
 * End Main Functions
 *
 * ****************************************************
 * Begin Events
 */

document.addEventListener("DOMContentLoaded", documentLoaded);

function generateOnClick(event) {
  const weatherData = {};
  const zip = document.getElementById("zip");
  const feelings = document.getElementById("feelings");
  const now = new Date();

  weatherData.feelings = feelings.value;
  weatherData.date = `${now.getDate()}.${
    now.getMonth() + 1
  }.${now.getFullYear()}`;

  getTemperature(zip.value).then((result) => {
    weatherData.temperature = result;
    uploadWeatherData(weatherData).then(updateWeatherHistory());
  });

  // reset input fields
  zip.value = "";
  feelings.value = "";
  zip.focus();
}

/**
 * Updating the weatherHistory
 */
async function updateWeatherHistory() {
  getWeatherHistoryData().then(showWeatherHistory);
}

/**
 * create and fill all elements needed to dispay the weatherHistory
 * @param {Array<object>} weatherHistory
 */
function showWeatherHistory(weatherHistory) {
  const historyFragment = new DocumentFragment();
  const ul = document.createElement("ul");

  for (entry of weatherHistory) {
    const li = document.createElement("li");
    const spanDate = document.createElement("span");
    const spanTemperature = document.createElement("span");
    const spanFeelings = document.createElement("span");

    spanDate.innerText = `Date: ${entry.date}`;
    spanTemperature.innerText = `Temperature: ${entry.temperature}`;
    spanFeelings.innerText = `Feelings: ${entry.feelings}`;

    li.appendChild(spanDate);
    li.appendChild(spanTemperature);
    li.appendChild(spanFeelings);

    ul.appendChild(li);
  }
  historyFragment.appendChild(ul);
  document.getElementById("historyHolder").replaceChildren(historyFragment);
}
