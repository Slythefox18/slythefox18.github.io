loadTimes();
document.getElementById("refresh").onclick = function () {
  clearTimes();
  loadTimes();
};

function clearTimes() {
  clearTime("senlac");
  clearTime("dufferin");
  clearTime("faywood");
  clearTime("yorkU");
  clearTime("sheppard");
  clearTime("sheppard-express");
  clearTime("finch");
}

function loadTimes() {
  displayTimes("98", "7108", "senlac");
  displayTimes("105", "14652", "dufferin");
  displayTimes("104", "14653", "faywood");
  displayTimes("107", "7275", "yorkU");
  displayTimes("84", "14651", "sheppard");
  displayTimes("984", "14654", "sheppard-express");
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
  times = times.map((time) => time.toString() + "m");
  document.getElementById(section).innerHTML = times.join(", ");
}

function clearTime(section) {
  document.getElementById(section).innerHTML = "Loading...";
}
