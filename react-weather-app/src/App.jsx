import { useState, useEffect } from "react";
import "./App.css";
import WeekItems from "./components/WeekItems.jsx";
import CurrentWeather from "./components/CurrentWeather.jsx";
function App() {
  const [search, setSearch] = useState(""); // holds search term (city)
  const [hasOutput, setHasOutput] = useState(false); // wether or not to display results
  const [key, setKey] = useState("c0356c567ab296fc6d78f6c30c3adba3"); //Weather API key
  const [coordinates, setCoordinates] = useState({}); // coordinates for given city
  const [currentWeather, setCurrentWeather] = useState({}); // json response for current weather
  const [fiveDay, setFiveDay] = useState([]); // json response for 5 day weather
  const [separatedFiveDay, setSeparatedFiveDay] = useState([]); // 5 day weather response separated by day

  const [weekHighLow, setWeekHighLow] = useState([]); //high and low temp of each day from 5 day separated weather response
  const [weekDescriptions, setWeekDescriptions] = useState([]); //most common description from each 5 day separated response

  const [combinedData,setCombinedData] = useState({});

  const handleInputChange = (event) => {
    setSearch(event.target.value);
  };


  const getCoordinates = async () => {
    const geocodeResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${search}&appid=${key}`
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
      temp: kelvinToCelcius(currentWeatherData.main.temp) ,
      time: unixTimeConverter(currentWeatherData.dt),
      lat: currentWeatherData.coord.lat,
      lon: currentWeatherData.coord.lon,
      feelsLike: kelvinToCelcius(currentWeatherData.main.feels_like),
      min: kelvinToCelcius(currentWeatherData.main.temp_min),
      max: kelvinToCelcius(currentWeatherData.main.temp_max),
      humidity: currentWeatherData.main.humidity,
      windSpeed: currentWeatherData.wind.speed,
      icon: currentWeatherData.weather[0].icon



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
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}`
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
    const averagedData = {};

  // Iterate over each day's entries
  Object.entries(separatedFiveDay).forEach(([dayKey, dayEntries]) => {
    // Create an object to store counts of each description and icon for the current day
    const dayDataCount = {
      descriptions: {}, // Store description counts
      icons: {}, // Store icon counts
    };

    // Count occurrences of each description and icon for the current day
    dayEntries.forEach(entry => {
      // Check if entry has weather data
      if (entry.weather?.length > 0) {
        // Access description and icon from the weather object
        const { description, icon } = entry.weather[0];
        dayDataCount.descriptions[description] = (dayDataCount.descriptions[description] || 0) + 1;
        dayDataCount.icons[icon] = (dayDataCount.icons[icon] || 0) + 1;
      }
    });

    // Find the most common description and icon for the current day
    const mostCommonDescription = Object.keys(dayDataCount.descriptions).reduce((a, b) =>
      dayDataCount.descriptions[a] > dayDataCount.descriptions[b] ? a : b, null);

    const mostCommonIcon = Object.keys(dayDataCount.icons).reduce((a, b) =>
      dayDataCount.icons[a] > dayDataCount.icons[b] ? a : b, null);

    // Store the most common description and icon for the current day
    averagedData[dayKey] = { description: mostCommonDescription, icon: mostCommonIcon };
  });

  setWeekDescriptions(averagedData);
}
function combineData() {
  const data = {};

  // Iterate over each day in weekHighLow and combine it with weekDescriptions
  Object.keys(weekHighLow).forEach((dayKey, index) => {
    const weekday = Object.keys(weekDescriptions)[index]; // Get the corresponding weekday key
    if (weekDescriptions.hasOwnProperty(weekday)) {
      data[weekday] = {
        dayName: weekday, // Add dayName field with the name of the day
        highTemp: weekHighLow[dayKey].high,
        lowTemp: weekHighLow[dayKey].low,
        description: weekDescriptions[weekday].description,
        icon: weekDescriptions[weekday].icon
      };
    }
  });

 

  return data;
}


useEffect(() => {
  console.log("currentWeather:", currentWeather);
}, [currentWeather]);

useEffect(() => {
  if (Object.keys(weekDescriptions).length > 0 && Object.keys(weekHighLow).length > 0) {
    const combinedData = combineData();
    //console.log("combinedData:", combinedData); // Log combined data directly
    setCombinedData(combinedData); // Update the state with the combined data
  }
}, [weekDescriptions, weekHighLow]);



useEffect(() => {
  console.log("combinedData:", combinedData);
}, [combinedData]);




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
      //console.log("fiveDay", fiveDay)
      createDailyData();
    }
  }, [fiveDay]);

  useEffect(() => {
    if (Object.keys(separatedFiveDay).length > 0) {
      fullHighLows();
      //console.log("separatedfiveday", separatedFiveDay);
      getaveragedescriptions();
    }
  }, [separatedFiveDay]);

  useEffect(() => {
    if (Object.keys(coordinates).length !== 0) {
      getCurrentWeather();
      getFiveDay();
      setHasOutput(true);
    }
  }, [coordinates]); // Include search in the dependency array
  

  return (
    <>

    <div id="search">
    <input type="text" value={search} onChange={handleInputChange} />
      <button onClick={handleSearch}>Search</button>

    </div>
      


      {hasOutput && ( //if has output is true
      <>

          <WeekItems data={combinedData}/>
          <CurrentWeather data={currentWeather}/>
          </>
      )}
    </>
  );
}

export default App;
