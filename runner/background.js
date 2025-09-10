addEventListener('myCustomEvent', (resolve, reject, args) => {
    console.log('do something to update the system here');
    resolve();
  });
  
  addEventListener('myCustomEventWithReturnData', (resolve, reject, args) => {
    try {
      console.log('accepted this data: ' + JSON.stringify(args.user));
  
      const updatedUser = args.user;
      updatedUser.firstName = updatedUser.firstName + ' HELLO';
      updatedUser.lastName = updatedUser.lastName + ' WORLD';
  
      resolve(updatedUser);
    } catch (err) {
      reject(err);
    }
  });
  
  addEventListener('remoteNotification', (resolve, reject, args) => {
    try {
      console.log('received silent push notification');
  
      CapacitorNotifications.schedule([
        {
          id: 100,
          title: 'Enterprise Background Runner',
          body: 'Received silent push notification',
        },
      ]);
  
      resolve();
    } catch (err) {
      reject();
    }
  });

  addEventListener("updateData", async (resolve, reject, args) => {
    try {
      const results = await Promise.allSettled([checkWeather(), checkNews()]);
  
      const currentTimestamp = Math.floor(Date.now() / 1000);
  
      let updateLog;
  
      let updateLogJSON = CapacitorKV.get("update_log");
  
      if (!updateLogJSON) {
        updateLog = {
          news: [],
          weather: [],
        };
      } else {
        updateLog = JSON.parse(updateLogJSON.value);
      }
  
      if (results[0].status == "fulfilled") {
        updateLog.weather.push({
          timestamp: currentTimestamp,
          status: "ok",
        });
      } else {
        updateLog.weather.push({
          timestamp: currentTimestamp,
          status: `failed: ${results[0].reason}`,
        });
      }
  
      if (results[1].status == "fulfilled") {
        updateLog.news.push({
          timestamp: currentTimestamp,
          status: "ok",
        });
      } else {
        updateLog.news.push({
          timestamp: currentTimestamp,
          status: `failed: ${results[1].reason}`,
        });
      }
  
      CapacitorKV.set("last_updated", currentTimestamp.toString());
      CapacitorKV.set("update_log", JSON.stringify(updateLog));
      resolve();
    } catch (err) {
      console.error(`Could not update data: ${err}`);
      reject(err);
    }
  });