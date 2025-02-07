let time = new Date();
let start = Date.now();
let calcWalkTime = true;
const finchWalkTime = 5;
const senlacWalkTime = 7;

loadFinchOverview();
loadSenlacOverview();
loadTimes();
refreshButton();
timestamp();
walkTimeToggle();
setInterval(() => {
  timesAge();
}, 1);
if (calcWalkTime) {
  document.getElementById("walkToggle").style.backgroundColor = "#383838";
} else {
  document.getElementById("walkToggle").style.backgroundColor = "grey";
}

function refreshButton() {
  document.getElementById("refresh").onclick = function () {
    clearTimes();
    loadTimes();

    clearFinchOverview();
    clearSenlacOverview();
    loadFinchOverview();
    loadSenlacOverview();
    resetTimestamp();
  };
}

function walkTimeToggle() {
  document.getElementById("walkToggle").onclick = function () {
    calcWalkTime = !calcWalkTime;
    if (calcWalkTime) {
      document.getElementById("walkToggle").style.backgroundColor = "#383838";
    } else {
      document.getElementById("walkToggle").style.backgroundColor = "grey";
    }

    clearTimes();
    loadTimes();

    clearFinchOverview();
    clearSenlacOverview();
    loadFinchOverview();
    loadSenlacOverview();
    resetTimestamp();
  };
}

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
  displayTimes("105", "3172", "dufferin");
  displayTimes("104", "14653", "faywood");
  displayTimes("107", "7275", "yorkU");
  displayTimes("84", "14651", "sheppard");
  displayTimes("984", "14654", "sheppardExpress");
  displayTimes("36", "3587", "finch");
}

async function getStopId(route, stopNum) {
  switch (stopNum) {
    case "14652":
      return "14174";
      break;
    case "7108":
      return "6481";
      break;
    case "14654":
      return "14175";
      break;
    case "7275":
      return "2365";
      break;
    case "14653":
      return "14619";
      break;
    case "14651":
      return "14173";
      break;
    case "3587":
      return "623";
      break;
    case "3172":
      return "8170";
      break;

    default:
      try {
        const response = await fetch(
          `https://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${route}`
        );
        const data = await response.json();
        const stop = data.route.stop.find((s) => s.stopId === stopNum);
        console.log("StopNum: " + stopNum + "StopTag: " + stop.tag);
        return stop ? stop.tag : null;
      } catch (error) {
        console.error(error);
        return null;
      }
      break;
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
    if (route === "107") {
      results.predictions.direction = results.predictions.direction.filter(
        (direction) => {
          if (Array.isArray(direction.prediction)) {
            return (
              direction.prediction[0].branch === "107D" ||
              direction.prediction[0].branch === "107B"
            );
          } else if (direction.prediction) {
            return (
              direction.prediction.branch === "107D" ||
              direction.prediction.branch === "107B"
            );
          }
          return false;
        }
      );
    }

    if (results.predictions && results.predictions.direction) {
      if (Array.isArray(results.predictions.direction)) {
        results.predictions.direction.forEach((d) => {
          if (Array.isArray(d.prediction)) {
            d.prediction.forEach((p) => {
              output.push(p.minutes);
            });
          } else if (d.prediction) {
            output.push(d.prediction.minutes);
          }
        });
      } else {
        if (Array.isArray(results.predictions.direction.prediction)) {
          results.predictions.direction.prediction.forEach((p) => {
            output.push(p.minutes);
          });
        } else if (results.predictions.direction.prediction) {
          output.push(results.predictions.direction.prediction.minutes);
        }
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
  if (times.length > 0) {
    document.getElementById(section).innerHTML = times.join(", ");
  } else {
    document.getElementById(section).innerHTML = "No times";
  }
}

function clearTime(section) {
  document.getElementById(section).innerHTML = "Loading...";
}

/*
  Distances

  84 to Senlac: 14m
  107 to Finch: 8m
  105 to Finch: 9m
  104 to Finch: 12m
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
    if (timeArray) {
      timeArray = timeArray.map(Number);
      if (calcWalkTime) {
        timeArray = timeArray.filter((time) => time > finchWalkTime);
      }
      timeArray = timeArray.sort((a, b) => a - b);
      if (
        timeArray.length > 0 &&
        timeArray[0] + getTravelTime(route) < minTimeFinchSectorOne
      ) {
        minTimeFinchSectorOne = timeArray[0] + getTravelTime(route);
        minRouteFinchSectorOne = route;
      }
    }
  }

  minTimeFinchSectorOne -= getTravelTime(minRouteFinchSectorOne);

  function getTravelTime(route) {
    switch (route) {
      case "105":
        return 11;
      case "104":
        return 14;
      case "107":
        return 9;
      default:
        return 0;
    }
  }

  let minTimeFinchSectorTwoIndex = times.finch.findIndex(function (time) {
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

  let minTimeFinchSectorTwo = times.finch[minTimeFinchSectorTwoIndex];
  if (minTimeFinchSectorTwo !== undefined) {
    switch (minRouteFinchSectorOne) {
      case "105":
        minTimeFinchSectorTwo =
          parseInt(minTimeFinchSectorTwo) -
          11 -
          parseInt(minTimeFinchSectorOne);
        break;
      case "104":
        minTimeFinchSectorTwo =
          parseInt(minTimeFinchSectorTwo) -
          14 -
          parseInt(minTimeFinchSectorOne);
        break;
      case "107":
        minTimeFinchSectorTwo =
          parseInt(minTimeFinchSectorTwo) - 9 - parseInt(minTimeFinchSectorOne);
        break;
    }
  } else {
    minTimeFinchSectorTwo = 0;
  }

  const isValid = (value) =>
    value !== undefined && value !== null && !isNaN(value);

  if (
    isValid(minRouteFinchSectorOne) &&
    isValid(minTimeFinchSectorOne) &&
    isValid(minTimeFinchSectorTwo)
  ) {
    document.getElementById(
      "overviewFinchPath"
    ).innerHTML = `Best Route: ${minRouteFinchSectorOne} + ${minRouteFinchSectorTwo}`;
    document.getElementById("overviewFinchTime").innerHTML = `Wait Time: ${
      parseInt(minTimeFinchSectorOne) + parseInt(minTimeFinchSectorTwo)
    }m`;
    document.getElementById(
      "overviewFinchSplit"
    ).innerHTML = `Split Times: ${minTimeFinchSectorOne}m + ${getTravelTime(
      minRouteFinchSectorOne
    )}m + ${minTimeFinchSectorTwo}m + 9m`;
    document.getElementById(
      "overviewFinchTotalTime"
    ).innerHTML = `Route Time: ${
      parseInt(minTimeFinchSectorOne) +
      getTravelTime(minRouteFinchSectorOne) +
      parseInt(minTimeFinchSectorTwo) +
      9
    }m`;
  } else {
    document.getElementById("overviewFinchPath").innerHTML = "Not available";
    document.getElementById("overviewFinchTime").innerHTML = ``;
    document.getElementById("overviewFinchSplit").innerHTML = ``;
    document.getElementById("overviewFinchTotalTime").innerHTML = ``;
  }
}

async function loadSenlacOverview() {
  const times = {
    senlac: await getStopTimes("98", "7108"),
    sheppard: await getStopTimes("84", "14651"),
    sheppardExpress: await getStopTimes("984", "14654"),
  };

  const sectorOneSenlac = {
    84: times.sheppard,
    984: times.sheppardExpress,
  };

  let minRouteSenlacSectorOne = null;
  let minTimeSenlacSectorOne = Infinity;

  for (let [route, timeArray] of Object.entries(sectorOneSenlac)) {
    if (timeArray.length > 0) {
      if (calcWalkTime) {
        timeArray = timeArray.filter((time) => time > senlacWalkTime);
      }
      if (timeArray.length > 0) {
        timeArray = timeArray.sort(function (a, b) {
          return a - b;
        });
        if (timeArray[0] < minTimeSenlacSectorOne) {
          minTimeSenlacSectorOne = timeArray[0];
          minRouteSenlacSectorOne = route;
        }
      }
    }
  }

  let minTimeSenlacSectorTwo = times.senlac.findIndex(function (time) {
    return time > 16 + parseInt(minTimeSenlacSectorOne);
  });
  let minRouteSenlacSectorTwo = "98";

  minTimeSenlacSectorTwo = times.senlac[minTimeSenlacSectorTwo];
  minTimeSenlacSectorTwo =
    parseInt(minTimeSenlacSectorTwo) - 14 - parseInt(minTimeSenlacSectorOne);

  const isValid = (value) =>
    value !== undefined && value !== null && !isNaN(value);

  if (isValid(minRouteSenlacSectorOne) && isValid(minRouteSenlacSectorTwo)) {
    document.getElementById(
      "overviewSenlacPath"
    ).innerHTML = `Best Route: ${minRouteSenlacSectorOne} + ${minRouteSenlacSectorTwo}`;
    document.getElementById("overviewSenlacTime").innerHTML = `Wait Time: ${
      parseInt(minTimeSenlacSectorOne) + parseInt(minTimeSenlacSectorTwo)
    }m`;
    document.getElementById(
      "overviewSenlacSplit"
    ).innerHTML = `Split Times: ${minTimeSenlacSectorOne}m + 14m + ${minTimeSenlacSectorTwo}m + 4m`;
    document.getElementById(
      "overviewSenlacTotalTime"
    ).innerHTML = `Route Time: ${
      parseInt(minTimeSenlacSectorOne) +
      14 +
      parseInt(minTimeSenlacSectorTwo) +
      4
    }m`;
  } else {
    document.getElementById("overviewSenlacPath").innerHTML = "Not available";
    document.getElementById("overviewSenlacTime").innerHTML = ``;
    document.getElementById("overviewSenlacSplit").innerHTML = ``;
    document.getElementById("overviewSenlacTotalTime").innerHTML = ``;
  }
}

function clearSenlacOverview() {
  document.getElementById("overviewSenlacPath").innerHTML = `Loading...`;
  document.getElementById("overviewSenlacTime").innerHTML = ``;
  document.getElementById("overviewSenlacSplit").innerHTML = ``;
  document.getElementById("overviewSenlacTotalTime").innerHTML = ``;
}

function clearFinchOverview(params) {
  document.getElementById("overviewFinchPath").innerHTML = `Loading...`;
  document.getElementById("overviewFinchTime").innerHTML = ``;
  document.getElementById("overviewFinchSplit").innerHTML = ``;
  document.getElementById("overviewFinchTotalTime").innerHTML = ``;
}

function timestamp() {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  document.getElementById("timestamp").innerHTML = `${time.toLocaleTimeString(
    "en-CA",
    { hour12: false }
  )}, ${dayNames[time.getDay()]}, ${time.toLocaleString("default", {
    month: "long",
  })} ${time.getDate()}`;
}

function timesAge() {
  const diff = Date.now() - start;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let timeString = "";

  if (days > 0) {
    timeString += `${days}d `;
  }
  if (hours > 0 || days > 0) {
    timeString += `${hours}h `;
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    timeString += `${minutes}m `;
  }
  timeString += `${seconds}s ago`;

  document.getElementById("timesAge").innerHTML = timeString;
}

function resetTimestamp() {
  start = Date.now();
  time = new Date();
  timestamp();
  timesAge();
}
