import { useState, useEffect } from "react";
import WeekItem from "./WeekItem.jsx";

const WeekItems = ({ data }) => {
  const [weekData, setWeekData] = useState({});

  useEffect(() => {
    setWeekData(data); // Update weekData when data prop changes
  }, [data]);

  return (
    <div className="weekItems">
      {Object.values(weekData).map((dayData, index) => (
        <WeekItem key={index} data={dayData} />
      ))}
    </div>
  );
};

export default WeekItems;
