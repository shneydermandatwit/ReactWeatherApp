import { useState, useEffect } from "react";
import "../App.css"

const WeekItem = ({ data }) => {
  const [dayData, setDayData] = useState({});
  const [url, setUrl] = useState();

  useEffect(() => {
    setDayData(data); // Update dayData when data prop changes
  }, [data]);

  const capitalizeFirstLetter = (str) => {
    if(!str){return};

    return str.replace(/\b\w/g, (match) => match.toUpperCase());
  };
  useEffect(() => {
    if (Object.keys(dayData).length > 0) {
      let icon = dayData.icon; // Change from const to let
      if (icon.includes("n")) {
        icon = icon.replace("n", "d");
      }

      const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      setUrl(iconUrl);
    }
  }, [dayData]);


  return (
    <div className="weekItem">
      <h1>{dayData.dayName}</h1>
      <img src={url} alt="Weather Icon" width={'150px'}/>
      <h3>{capitalizeFirstLetter(dayData.description)}</h3>
      <h3>High: {dayData.highTemp} °F</h3>
      <h3>Low: {dayData.lowTemp} °F</h3>



    </div>
  );
};

export default WeekItem;
