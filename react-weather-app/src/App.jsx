import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("boston"); // holds search term (city)
  const [hasOutput, setHasOutput] = useState(false); // wether or not to display results
  const [key, setKey] = useState("c0356c567ab296fc6d78f6c30c3adba3"); //Weather API key
  const [coordinates, setCoordinates] = useState({}); // coordinates for given city
  const [currentWeather, setCurrentWeather] = useState({}); // json response for current weather
  const [fiveDay, setFiveDay] = useState([]); // json response for 5 day weather
  const [separatedFiveDay, setSeparatedFiveDay] = useState([]); // 5 day weather response separated by day

  const [weekHighLow, setWeekHighLow] = useState([]); //high and low temp of each day from 5 day separated weather response
  const [weekDescriptions, setWeekDescriptions] = useState([]); //most common description from each 5 day separated response

  const handleInputChange = (event) => {
    setSearch(event.target.value);
  };


  const getCoordinates = async () => {
    const geocodeResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${search}&appid=${key}`
    );
    const coordinateData = await geocodeResponse.json();
    setCoordinates({
      lat: coordinateData[0].lat,
      lon: coordinateData[0].lon,
    });
  };

  const getCurrentWeather = async () => {
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}`
    );
    const currentWeatherData = await currentWeatherResponse.json();
    setCurrentWeather({
      description: currentWeatherData.weather[0].description,
      temp: currentWeatherData.main.temp,
      time: unixTimeConverter(currentWeatherData.dt),
    });
  };



  const handleSearch = async () => {
    await getCoordinates();
  };

  const unixTimeConverter = (unixTime) => {
    var date = new Date(unixTime * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();

    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayOfWeek = daysOfWeek[date.getDay()];
    var formattedTime = currentDayOfWeek + " " + date.getDate() + "----" +

      hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
    return formattedTime;
  };

  const weekDayString = (unixTime) => {
    var date = new Date(unixTime * 1000);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayOfWeek = `${daysOfWeek[date.getDay()]}`;
    return currentDayOfWeek;
  }

  const getFiveDay = async () => {
    const fiveDayResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=42.3554334&lon=-71.060511&appid=${key}`
    );
    const fiveDayData = await fiveDayResponse.json();
    setFiveDay(fiveDayData.list);

  }

  const kelvinToCelcius = (kelvin) => {
    kelvin = parseInt(kelvin);
    return Math.round((((kelvin - 273.15) * 1.8) + 32) * 10) / 10;
  }

  const dayHighLow = (dayData) => {
    let highest = Number.MIN_SAFE_INTEGER;
    let lowest = Number.MAX_SAFE_INTEGER;

    dayData.forEach(entry => {
      if (entry.main.temp > highest) {
        highest = entry.main.temp;
      }
      if (entry.main.temp < lowest) {
        lowest = entry.main.temp;
      }
    });

    return { highest, lowest };
  }

  const fullHighLows = () => {


    // Calculate high and low temperatures for each day and update state
    const updatedWeekHighLow = Object.keys(separatedFiveDay).map(dayKey => {
      const { highest, lowest } = dayHighLow(separatedFiveDay[dayKey]);
      return {
        day: dayKey,
        high: kelvinToCelcius(highest),
        low: kelvinToCelcius(lowest)
      };
    });

    // Update the state with the calculated high and low temperatures for each day
    setWeekHighLow(updatedWeekHighLow);
  };
  const createDailyData = () => {
    const separatedSegments = {};
    //console.log(fiveDay);
    // Separate forecasts by day
    fiveDay.forEach(entry => {
      const dayKey = weekDayString(entry.dt);

      if (!separatedSegments[dayKey]) {
        separatedSegments[dayKey] = [];
      }

      separatedSegments[dayKey].push(entry);
    });
    setSeparatedFiveDay(separatedSegments);
  }

  function getaveragedescriptions() {
    // Create an object to store counts of each weather description for each day
    const descriptionsCount = {};

    // Iterate over each day's entries
    Object.entries(separatedFiveDay).forEach(([dayKey, dayEntries]) => {
        // Create an object to store counts of each description for the current day
        const dayDescriptionsCount = {};

        // Count occurrences of each description for the current day
        dayEntries.forEach(entry => {
            // Check if entry has weather data
            if (entry.weather?.length > 0) {
                // Access description from the first weather object
                const description = entry.weather[0].description;
                dayDescriptionsCount[description] = (dayDescriptionsCount[description] || 0) + 1;
            }
        });

        // Find the most common description for the current day
        const mostCommonDescription = Object.keys(dayDescriptionsCount).reduce((a, b) => {
            // Check if dayDescriptionsCount is empty
            if (!a) return b; // If a is empty, return b
            return dayDescriptionsCount[a] > dayDescriptionsCount[b] ? a : b;
        }, null); // Provide initial value as null

        // Store the most common description for the current day
        descriptionsCount[dayKey] = mostCommonDescription;
    });

    setWeekDescriptions(descriptionsCount);
}


useEffect(() => {
  if (Object.keys(weekDescriptions).length > 0) {

    console.log("weekdescriptions:", weekDescriptions);
  }
}, [weekDescriptions]);

  useEffect(() => {
    // This effect will run whenever weekHighLow changes
    if (weekHighLow.length > 0) {

      console.log("weekHighLow:", weekHighLow);
    }
  }, [weekHighLow]);
  

  useEffect(() => {
    if (fiveDay.length > 0) {
      console.log("fiveDay", fiveDay)
      createDailyData();
    }
  }, [fiveDay]);

  useEffect(() => {
    if (Object.keys(separatedFiveDay).length > 0) {
      fullHighLows();
      console.log("separatedfiveday", separatedFiveDay);
      getaveragedescriptions();
    }
  }, [separatedFiveDay]);

  useEffect(() => {
    if (Object.keys(coordinates).length !== 0) {
      getCurrentWeather();
      getFiveDay();
      setHasOutput(true);
    }
  }, [coordinates]); // Only re-run the effect if coordinates change

  return (
    <>
      <input type="text" value={search} onChange={handleInputChange} />
      <button onClick={handleSearch}>Search</button>
      {hasOutput && ( //if has output is true
        <div>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lon}</p>
          <p>Description: {currentWeather.description}</p>
          <p>Temp: {currentWeather.temp}</p>
          <p>Time: {currentWeather.time}</p>
          <ol>
            {fiveDay.map((forecast, index) => (
              <li key={index}>{weekDayString(forecast.dt)} = {kelvinToCelcius(forecast.main.temp)}</li>
            ))}
          </ol>

        </div>
      )}
    </>
  );
}

export default App;
