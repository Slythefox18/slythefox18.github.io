loadFinchOverview();
loadSenlacOverview();
loadTimes();
document.getElementById("refresh").onclick = function () {
  clearTimes();
  loadTimes();

  clearFinchOverview();
  clearSenlacOverview();
  loadFinchOverview();
  loadSenlacOverview();
};

function clearTimes() {
  clearTime("senlac");
  clearTime("dufferin");
  clearTime("faywood");
  clearTime("yorkU");
  clearTime("sheppard");
  clearTime("sheppardExpress");
  clearTime("finch");
}

function loadTimes() {
  displayTimes("98", "7108", "senlac");
  displayTimes("105", "14652", "dufferin");
  displayTimes("104", "14653", "faywood");
  displayTimes("107", "7275", "yorkU");
  displayTimes("84", "14651", "sheppard");
  displayTimes("984", "14654", "sheppardExpress");
  displayTimes("36", "3587", "finch");
}

async function getStopId(route, stopNum) {
  try {
    const response = await fetch(
      `https://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${route}`
    );
    const data = await response.json();
    const stop = data.route.stop.find((s) => s.stopId === stopNum);
    return stop ? stop.tag : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getStopTimes(route, stopNum) {
  const output = [];
  const stopTag = await getStopId(route, stopNum);
  if (!stopTag) {
    return null;
  }
  try {
    const response = await fetch(
      `https://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r=${route}&s=${stopTag}`
    );
    const results = await response.json();
    if (Array.isArray(results.predictions.direction)) {
      results.predictions.direction.forEach((d) => {
        if (Array.isArray(d.prediction)) {
          d.prediction.forEach((p) => {
            output.push(p.minutes);
          });
        } else {
          output.push(d.prediction.minutes);
        }
      });
    } else {
      if (Array.isArray(results.predictions.direction.prediction)) {
        results.predictions.direction.prediction.forEach((p) => {
          output.push(p.minutes);
        });
      } else {
        output.push(results.predictions.direction.prediction.minutes);
      }
    }
    return output;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function displayTimes(route, stop, section) {
  let times = await getStopTimes(route, stop);
  times = times.sort(function (a, b) {
    return a - b;
  });
  times = times.map((time) => time.toString() + "m");
  document.getElementById(section).innerHTML = times.join(", ");
}

function clearTime(section) {
  document.getElementById(section).innerHTML = "Loading...";
}

/*
Distances

84 to Senlac: 14
107 to Finch: 8
105 to Finch: 9
104 to Finch: 12
*/

async function loadFinchOverview() {
  const times = {
    dufferin: await getStopTimes("105", "14652"),
    faywood: await getStopTimes("104", "14653"),
    yorkU: await getStopTimes("107", "7275"),
    finch: await getStopTimes("36", "3587"),
  };

  let minRouteFinchSectorOne = null;
  let minTimeFinchSectorOne = Infinity;
  const sectorOneFinch = {
    105: times.dufferin,
    104: times.faywood,
    107: times.yorkU,
  };
  for (let [route, timeArray] of Object.entries(sectorOneFinch)) {
    timeArray.sort(function (a, b) {
      a = parseInt(a);
      b = parseInt(b);
      return a - b;
    });
    if (timeArray[0] < minTimeFinchSectorOne) {
      minTimeFinchSectorOne = timeArray[0];
      minRouteFinchSectorOne = route;
    }
  }

  let minTimeFinchSectorTwo = times.finch.findIndex(function (time) {
    if (minRouteFinchSectorOne === "105") {
      return time > 11 + parseInt(minTimeFinchSectorOne);
    }
    if (minRouteFinchSectorOne === "104") {
      return time > 14 + parseInt(minTimeFinchSectorOne);
    }
    if (minRouteFinchSectorOne === "107") {
      return time > 9 + parseInt(minTimeFinchSectorOne);
    }
  });
  let minRouteFinchSectorTwo = "36";

  minTimeFinchSectorTwo = times.finch[minTimeFinchSectorTwo];
  switch (minRouteFinchSectorOne) {
    case "105":
      minTimeFinchSectorTwo =
        parseInt(minTimeFinchSectorTwo) - 11 - parseInt(minTimeFinchSectorOne);
      break;
    case "104":
      minTimeFinchSectorTwo =
        parseInt(minTimeFinchSectorTwo) - 14 - parseInt(minTimeFinchSectorOne);
      break;
    case "107":
      minTimeFinchSectorTwo =
        parseInt(minTimeFinchSectorTwo) - 9 - parseInt(minTimeFinchSectorOne);
      break;
  }

  document.getElementById(
    "overviewFinchPath"
  ).innerHTML = `Best Route: ${minRouteFinchSectorOne} + ${minRouteFinchSectorTwo}`;
  document.getElementById("overviewFinchTime").innerHTML = `Wait Time: ${
    parseInt(minTimeFinchSectorOne) + parseInt(minTimeFinchSectorTwo)
  }m`;
  document.getElementById(
    "overviewFinchSplit"
  ).innerHTML = `Split Times: ${minTimeFinchSectorOne}m + ${minTimeFinchSectorTwo}m`;
}

async function loadSenlacOverview() {
  const times = {
    senlac: await getStopTimes("98", "7108"),
    sheppard: await getStopTimes("84", "14651"),
    sheppardExpress: await getStopTimes("984", "14654"),
  };

  const sectorOneSenlac = {
    84: times.sheppardExpress,
    984: times.sheppardExpress,
  };

  let minTimeSenlacSectorTwo = times.senlac.findIndex(function (time) {
    return time > 16;
  });
  let minRouteSenlacSectorTwo = "98";

  let minRouteSenlacSectorOne = null;
  let minTimeSenlacSectorOne = Infinity;

  for (let [route, timeArray] of Object.entries(sectorOneSenlac)) {
    timeArray = timeArray.sort(function (a, b) {
      a = parseInt(a);
      b = parseInt(b);
      return a - b;
    });
    if (
      timeArray &&
      timeArray.length > 0 &&
      timeArray[0] < minTimeSenlacSectorOne
    ) {
      minTimeSenlacSectorOne = timeArray[0];
      minRouteSenlacSectorOne = route;
    }
  }

  minTimeSenlacSectorTwo = times.senlac[minTimeSenlacSectorTwo];
  minTimeSenlacSectorTwo =
    parseInt(minTimeSenlacSectorTwo) - 14 - parseInt(minTimeSenlacSectorOne);

  document.getElementById(
    "overviewSenlacPath"
  ).innerHTML = `Best Route: ${minRouteSenlacSectorOne} + ${minRouteSenlacSectorTwo}`;
  document.getElementById("overviewSenlacTime").innerHTML = `Wait Time: ${
    parseInt(minTimeSenlacSectorOne) + parseInt(minTimeSenlacSectorTwo)
  }m`;
  document.getElementById(
    "overviewSenlacSplit"
  ).innerHTML = `Split Times: ${minTimeSenlacSectorOne}m + ${minTimeSenlacSectorTwo}m`;
}

function clearSenlacOverview() {
  document.getElementById("overviewSenlacPath").innerHTML = `Loading...`;
  document.getElementById("overviewSenlacTime").innerHTML = `Loading...`;
  document.getElementById("overviewSenlacSplit").innerHTML = `Loading...`;
}

function clearFinchOverview(params) {
  document.getElementById("overviewFinchPath").innerHTML = `Loading...`;
  document.getElementById("overviewFinchTime").innerHTML = `Loading...`;
  document.getElementById("overviewFinchSplit").innerHTML = `Loading...`;
}
