import React, { useState, useEffect } from "react";
import StreakDay from "../Components/StreakDay";
import StreakWeek from "../Components/StreakWeek";
import Grid from "@material-ui/core/Grid";
import moment from "moment";
import { useAuth } from "../context/auth";
import URL from "../utils/getUrl";

const getData = async (token) => {
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  const weekResponse = await fetch(`${URL}/weeks?Current_eq=true`, {
    headers: myHeaders,
  });
  const weekData = await weekResponse.json();
  if (weekData.length === 0) {
    return { week: {}, activitySets: [] };
  }

  const asSets = await fetch(
    `${URL}/activity-sets?weeks_eq=${weekData[0].id}`,
    { headers: myHeaders }
  );
  const asSetData = await asSets.json();
  const startDate = moment(weekData[0].WeekStartDate);
  const currentDate = moment();

  const promises = asSetData.map(async (as) => {
    const response = await fetch(`${URL}/activities?activity_set=${as.id}`, {
      headers: myHeaders,
    });
    return response.json();
  });

  const activities = await Promise.all(promises).then((promise) => promise);
  const activitySets = {};
  try {
    activities.map((a) => {
      activitySets[a[0].activity_set.id] = a;
    });
  } catch (error) {
    console.log("Activity set with no activities", asSetData);
  }

  const weekPayload = weekData[0] || {};
  const returnData = {
    week: weekPayload,
    activitySets,
  };

  return returnData;
};

export default function Dashboard() {
  const [isModified, setIsModified] = useState(0);
  const { userId, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const update = () => {
    setIsModified(isModified + 1);
  };

  useEffect(() => {
    handleDataUpdate();
  }, []);

  useEffect(async () => {
    const activityData = await getData(token);
    setData(activityData);
  }, [isModified]);

  const handleDataUpdate = async () => {
    const activityData = await getData(token);
    setData(activityData);
    setLoading(false);
    setIsModified(isModified + 1);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <StreakDay update={update} isModified={isModified} />
      </Grid>
      <Grid item xs={9}>
        <StreakWeek
          handleDataUpdate={handleDataUpdate}
          data={data}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
}
