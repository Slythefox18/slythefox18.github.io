function clearTimes() {
  clearTime("senlac"),
    clearTime("dufferin"),
    clearTime("faywood"),
    clearTime("yorkU"),
    clearTime("sheppard"),
    clearTime("sheppardExpress"),
    clearTime("finch");
}
function loadTimes() {
  displayTimes("98", "7108", "senlac"),
    displayTimes("105", "14652", "dufferin"),
    displayTimes("104", "14653", "faywood"),
    displayTimes("107", "7275", "yorkU"),
    displayTimes("84", "14651", "sheppard"),
    displayTimes("984", "14654", "sheppardExpress"),
    displayTimes("36", "3587", "finch");
}
async function getStopId(e, n) {
  switch (n) {
    case "14652":
      return "14174";
    case "7108":
      return "6481";
    case "14654":
      return "14175";
    case "7275":
      return "2365";
    case "14653":
      return "14619";
    case "14651":
      return "14173";
    case "3587":
      return "623";
    default:
      try {
        const t = await fetch(
            `https://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${e}`
          ),
          i = (await t.json()).route.stop.find((e) => e.stopId === n);
        return (
          console.log("StopNum: " + n + "StopTag: " + i.tag), i ? i.tag : null
        );
      } catch (e) {
        return console.error(e), null;
      }
  }
}
async function getStopTimes(e, n) {
  const t = [],
    i = await getStopId(e, n);
  if (!i) return null;
  try {
    const n = await fetch(
        `https://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r=${e}&s=${i}`
      ),
      r = await n.json();
    return (
      r.predictions &&
        r.predictions.direction &&
        (Array.isArray(r.predictions.direction)
          ? r.predictions.direction.forEach((e) => {
              Array.isArray(e.prediction)
                ? e.prediction.forEach((e) => {
                    t.push(e.minutes);
                  })
                : e.prediction && t.push(e.prediction.minutes);
            })
          : Array.isArray(r.predictions.direction.prediction)
          ? r.predictions.direction.prediction.forEach((e) => {
              t.push(e.minutes);
            })
          : r.predictions.direction.prediction &&
            t.push(r.predictions.direction.prediction.minutes)),
      t
    );
  } catch (e) {
    return console.error(e), null;
  }
}
async function displayTimes(e, n, t) {
  let i = await getStopTimes(e, n);
  (i = i.sort(function (e, n) {
    return e - n;
  })),
    (i = i.map((e) => e.toString() + "m")),
    i.length > 0
      ? (document.getElementById(t).innerHTML = i.join(", "))
      : (document.getElementById(t).innerHTML = "No times");
}
function clearTime(e) {
  document.getElementById(e).innerHTML = "Loading...";
}
async function loadFinchOverview() {
  const e = {
    dufferin: await getStopTimes("105", "14652"),
    faywood: await getStopTimes("104", "14653"),
    yorkU: await getStopTimes("107", "7275"),
    finch: await getStopTimes("36", "3587"),
  };
  let n = null,
    t = 1 / 0;
  const i = { 105: e.dufferin, 104: e.faywood, 107: e.yorkU };
  for (let [e, o] of Object.entries(i))
    o &&
      ((o = o.map(Number).sort((e, n) => e - n)),
      o.length > 0 &&
        parseInt(o[0]) + r(e) < t &&
        ((t = parseInt(o[0]) + r(e)), (n = e)));
  function r(e) {
    switch (e) {
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
  t -= r(n);
  let o = e.finch.findIndex(function (e) {
      return "105" === n
        ? e > 11 + parseInt(t)
        : "104" === n
        ? e > 14 + parseInt(t)
        : "107" === n
        ? e > 9 + parseInt(t)
        : void 0;
    }),
    c = e.finch[o];
  if (void 0 !== c)
    switch (n) {
      case "105":
        c = parseInt(c) - 11 - parseInt(t);
        break;
      case "104":
        c = parseInt(c) - 14 - parseInt(t);
        break;
      case "107":
        c = parseInt(c) - 9 - parseInt(t);
    }
  else c = 0;
  const a = (e) => null != e && !isNaN(e);
  a(n) && a(t) && a(c)
    ? ((document.getElementById(
        "overviewFinchPath"
      ).innerHTML = `Best Route: ${n} + 36`),
      (document.getElementById("overviewFinchTime").innerHTML = `Wait Time: ${
        parseInt(t) + parseInt(c)
      }m`),
      (document.getElementById(
        "overviewFinchSplit"
      ).innerHTML = `Split Times: ${t}m + ${r(n)}m + ${c}m + 9m`),
      (document.getElementById(
        "overviewFinchTotalTime"
      ).innerHTML = `Route Time: ${parseInt(t) + r(n) + parseInt(c) + 9}m`))
    : ((document.getElementById("overviewFinchPath").innerHTML =
        "Not available"),
      (document.getElementById("overviewFinchTime").innerHTML = ""),
      (document.getElementById("overviewFinchSplit").innerHTML = ""),
      (document.getElementById("overviewFinchTotalTime").innerHTML = ""));
}
async function loadSenlacOverview() {
  const e = {
      senlac: await getStopTimes("98", "7108"),
      sheppard: await getStopTimes("84", "14651"),
      sheppardExpress: await getStopTimes("984", "14654"),
    },
    n = { 84: e.sheppard, 984: e.sheppardExpress };
  let t = null,
    i = 1 / 0;
  for (let [e, r] of Object.entries(n))
    r.length > 0 &&
      ((r = r.sort(function (e, n) {
        return e - n;
      })),
      r[0] < i && ((i = r[0]), (t = e)));
  let r = e.senlac.findIndex(function (e) {
    return e > 16 + parseInt(i);
  });
  (r = e.senlac[r]), (r = parseInt(r) - 14 - parseInt(i));
  const o = (e) => null != e && !isNaN(e);
  o(t) && o("98")
    ? ((document.getElementById(
        "overviewSenlacPath"
      ).innerHTML = `Best Route: ${t} + 98`),
      (document.getElementById("overviewSenlacTime").innerHTML = `Wait Time: ${
        parseInt(i) + parseInt(r)
      }m`),
      (document.getElementById(
        "overviewSenlacSplit"
      ).innerHTML = `Split Times: ${i}m + 14m + ${r}m + 4m`),
      (document.getElementById(
        "overviewSenlacTotalTime"
      ).innerHTML = `Route Time: ${parseInt(i) + 14 + parseInt(r) + 4}m`))
    : ((document.getElementById("overviewSenlacPath").innerHTML =
        "Not available"),
      (document.getElementById("overviewSenlacTime").innerHTML = ""),
      (document.getElementById("overviewSenlacSplit").innerHTML = ""),
      (document.getElementById("overviewSenlacTotalTime").innerHTML = ""));
}
function clearSenlacOverview() {
  (document.getElementById("overviewSenlacPath").innerHTML = "Loading..."),
    (document.getElementById("overviewSenlacTime").innerHTML = ""),
    (document.getElementById("overviewSenlacSplit").innerHTML = ""),
    (document.getElementById("overviewSenlacTotalTime").innerHTML = "");
}
function clearFinchOverview(e) {
  (document.getElementById("overviewFinchPath").innerHTML = "Loading..."),
    (document.getElementById("overviewFinchTime").innerHTML = ""),
    (document.getElementById("overviewFinchSplit").innerHTML = ""),
    (document.getElementById("overviewFinchTotalTime").innerHTML = "");
}
loadFinchOverview(),
  loadSenlacOverview(),
  loadTimes(),
  (document.getElementById("refresh").onclick = function () {
    clearTimes(),
      loadTimes(),
      clearFinchOverview(),
      clearSenlacOverview(),
      loadFinchOverview(),
      loadSenlacOverview();
  });
