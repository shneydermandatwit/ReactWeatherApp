import { useState, useEffect } from "react";
import "../App.css"

const CurrentWeather = ({data}) => {

    const [weatherData, setWeatherData] = useState({});
    const [url, setUrl] = useState();

    const capitalizeFirstLetter = (str) => {
      if(!str){return};
      return str.replace(/\b\w/g, (match) => match.toUpperCase());
    };


    useEffect(() => {
        setWeatherData(data); // Update dayData when data prop changes
      }, [data]);

      useEffect(() => {
        if (Object.keys(weatherData).length > 0) {
          let icon = weatherData.icon; // Change from const to let
          
    
          const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
          setUrl(iconUrl);
        }
        console.log(weatherData)
      }, [weatherData]);



    

     
  

  return (
    <div id="current">
      <div id="left">
      <h4>Temperature: {weatherData.temp} °F</h4>
      <h4>Feels Like: {weatherData.feelsLike} °F</h4>
      <h4>Min Temperature: {weatherData.min} °F</h4>
      <h4>Max Temperature: {weatherData.max} °F</h4>

      </div>
      <div id="center">
      <h2>Current Weather</h2>
      <h4>Time: {weatherData.time}</h4>
      <img src={url} alt="Weather Icon" width={'165px'}/>




        
      </div>
      <div id="right">
      <h4>Description: {capitalizeFirstLetter(weatherData.description)}</h4>

      
<h4>Humidity: {weatherData.humidity}%</h4>
<h4>Wind Speed: {weatherData.windSpeed} m/s</h4>
        
      </div>
     
     
    </div>
  );
};

export default CurrentWeather;
