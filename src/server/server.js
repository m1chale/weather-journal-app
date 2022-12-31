/** Express router providing user related routes
 * @module server/server
 * @requires express
 * @requires body-parser
 * @requires cors
 * @requires joi
 */

/**
 * ****************************************************
 * Define environment
 */
const port = process.env.PORT || 8080;

/**
 * ****************************************************
 * Define dependencies
 */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Joi = require("joi");

/**
 * ****************************************************
 * Define data objects
 */
const weatherRecords = [
  {
    id: 1,
    date: new Date(1995, 11, 17),
    temperature: 25,
    feelings: "nice weather",
  },
];

/**
 * ****************************************************
 * Server configuration
 */

// Start up an instance of app
const app = express();

/* Middleware*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static("src/website"));

// Setup Server
app.listen(port, listening);

function listening() {
  console.log(`Server is up and listening on port: ${port} ...`);
}

/**
 * ****************************************************
 * Route handling
 */

/**
 * Route serving weather data.
 * @name get/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/weather-records", (request, response) => {
  response.send(weatherRecords);
});

/**
 * Route serving single weather record.
 * @name get/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get("/api/weather-records/:id", (request, response) => {
  //request.query = sortBy=name
  const weatherData = weatherRecords.find(
    (elem) => elem.id === parseInt(request.params.id)
  );

  if (!weatherData) return response.status(404).send("ID not found.");

  response.send(weatherData);
});

/**
 * Route accepting single weather record.
 * @name post/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.post("/api/weather-records", (request, response) => {
  const { error } = validateWeatherData(request.body);

  if (error) return response.status(400).send(error.details[0].message);

  const weatherData = {
    id: weatherRecords.length + 1,
    date: request.body.date,
    temperature: request.body.temperature,
    feelings: request.body.feelings,
  };

  weatherRecords.push(weatherData);
  response.send(weatherData);
});

/**
 * Route updating single weather record.
 * @name put/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.put("/api/weather-records/:id", (request, response) => {
  const weatherData = weatherRecords.find(
    (elem) => elem.id === parseInt(request.params.id)
  );

  if (!weatherData) return response.status(404).send("ID not found.");

  const { error } = validateWeatherData(request.body);

  if (error) return response.status(400).send(error.details[0].message);

  weatherData.date = request.body.date;
  weatherData.temperature = request.body.temperature;
  weatherData.feelings = request.body.feelings;

  response.send(weatherData);
});

/**
 * Route deleting single weather record.
 * @name delete/weather-records
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.delete("/api/weather-records/:id", (request, response) => {
  const weatherData = weatherRecords.find(
    (elem) => elem.id === parseInt(request.params.id)
  );

  if (!weatherData) return response.status(404).send("ID not found.");

  const index = weatherRecords.indexOf(weatherData);
  weatherRecords.splice(index, 1);
  response.send(weatherData);
});

/**
 * ****************************************************
 * Validation
 */

/**
 * Route serving weather data.
 * @name validateWeatherData
 * @function
 * @param {Object} weatherData - received weather record
 * @returns {Joi.ObjectSchema<any>} - validation result
 */
function validateWeatherData(weatherData) {
  const validationSchema = Joi.object({
    date: Joi.string().required(),
    temperature: Joi.number().required(),
    feelings: Joi.string().min(3).required(),
  });

  return validationSchema.validate(weatherData);
}
