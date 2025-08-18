let time = new Date(),
  start = Date.now(),
  calcWalkTime = !0;
const finchWalkTime = 5,
  senlacWalkTime = 7;
function refreshButton() {
  document.getElementById("refresh").onclick = function () {
    clearTimes(),
      loadTimes(),
      clearFinchOverview(),
      clearSenlacOverview(),
      loadFinchOverview(),
      loadSenlacOverview(),
      resetTimestamp();
  };
}
function walkTimeToggle() {
  document.getElementById("walkToggle").onclick = function () {
    (calcWalkTime = !calcWalkTime)
      ? (document.getElementById("walkToggle").style.backgroundColor =
          "#383838")
      : (document.getElementById("walkToggle").style.backgroundColor = "grey"),
      clearTimes(),
      loadTimes(),
      clearFinchOverview(),
      clearSenlacOverview(),
      loadFinchOverview(),
      loadSenlacOverview(),
      resetTimestamp();
  };
}
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
    displayTimes("105", "3172", "dufferin"),
    displayTimes("104", "14653", "faywood"),
    displayTimes("107", "7275", "yorkU"),
    displayTimes("84", "14651", "sheppard"),
    displayTimes("984", "14654", "sheppardExpress"),
    displayTimes("36", "3587", "finch");
}
async function getStopId(e, i) {
  switch (i) {
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
    case "3172":
      return "8170";
    default:
      try {
        let t = await fetch(
            `https://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${e}`
          ),
          n = await t.json(),
          r = n.route.stop.find((e) => e.stopId === i);
        return (
          console.log("StopNum: " + i + "StopTag: " + r.tag), r ? r.tag : null
        );
      } catch (a) {
        return console.error(a), null;
      }
  }
}
async function getStopTimes(e, i) {
  let t = [],
    n = await getStopId(e, i);
  if (!n) return null;
  try {
    let r = await fetch(
        `https://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r=${e}&s=${n}`
      ),
      a = await r.json();
    return (
      "107" === e &&
        (a.predictions.direction = a.predictions.direction.filter((e) =>
          Array.isArray(e.prediction)
            ? "107D" === e.prediction[0].branch ||
              "107B" === e.prediction[0].branch
            : !!e.prediction &&
              ("107D" === e.prediction.branch || "107B" === e.prediction.branch)
        )),
      a.predictions &&
        a.predictions.direction &&
        (Array.isArray(a.predictions.direction)
          ? a.predictions.direction.forEach((e) => {
              Array.isArray(e.prediction)
                ? e.prediction.forEach((e) => {
                    t.push(e.minutes);
                  })
                : e.prediction && t.push(e.prediction.minutes);
            })
          : Array.isArray(a.predictions.direction.prediction)
          ? a.predictions.direction.prediction.forEach((e) => {
              t.push(e.minutes);
            })
          : a.predictions.direction.prediction &&
            t.push(a.predictions.direction.prediction.minutes)),
      t
    );
  } catch (o) {
    return console.error(o), null;
  }
}
async function displayTimes(e, i, t) {
  let n = await getStopTimes(e, i);
  (n = (n = n.sort(function (e, i) {
    return e - i;
  })).map((e) => e.toString() + "m")).length > 0
    ? (document.getElementById(t).innerHTML = n.join(", "))
    : (document.getElementById(t).innerHTML = "No times");
}
function clearTime(e) {
  document.getElementById(e).innerHTML = "Loading...";
}
async function loadFinchOverview() {
  let e = {
      dufferin: await getStopTimes("105", "3172"),
      faywood: await getStopTimes("104", "14653"),
      yorkU: await getStopTimes("107", "7275"),
      finch: await getStopTimes("36", "3587"),
    },
    i = null,
    t = 1 / 0,
    n = { 105: e.dufferin, 104: e.faywood, 107: e.yorkU };
  for (let [r, a] of Object.entries(n))
    a &&
      ((a = a.map(Number)),
      calcWalkTime && (a = a.filter((e) => e > 5)),
      (a = a.sort((e, i) => e - i)).length > 0 &&
        a[0] + o(r) < t &&
        ((t = a[0] + o(r)), (i = r)));
  function o(e) {
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
  t -= o(i);
  let l = e.finch.findIndex(function (e) {
      return "105" === i
        ? e > 11 + parseInt(t)
        : "104" === i
        ? e > 14 + parseInt(t)
        : "107" === i
        ? e > 9 + parseInt(t)
        : void 0;
    }),
    c = e.finch[l];
  if (void 0 !== c)
    switch (i) {
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
  let s = (e) => null != e && !isNaN(e);
  s(i) && s(t) && s(c)
    ? ((document.getElementById(
        "overviewFinchPath"
      ).innerHTML = `Best Route: ${i} + 36`),
      (document.getElementById("overviewFinchTime").innerHTML = `Wait Time: ${
        parseInt(t) + parseInt(c)
      }m`),
      (document.getElementById(
        "overviewFinchSplit"
      ).innerHTML = `Split Times: ${t}m + ${o(i)}m + ${c}m + 9m`),
      (document.getElementById(
        "overviewFinchTotalTime"
      ).innerHTML = `Route Time: ${parseInt(t) + o(i) + parseInt(c) + 9}m`))
    : ((document.getElementById("overviewFinchPath").innerHTML =
        "Not available"),
      (document.getElementById("overviewFinchTime").innerHTML = ""),
      (document.getElementById("overviewFinchSplit").innerHTML = ""),
      (document.getElementById("overviewFinchTotalTime").innerHTML = ""));
}
async function loadSenlacOverview() {
  let e = {
      senlac: await getStopTimes("98", "7108"),
      sheppard: await getStopTimes("84", "14651"),
      sheppardExpress: await getStopTimes("984", "14654"),
    },
    i = { 84: e.sheppard, 984: e.sheppardExpress },
    t = null,
    n = 1 / 0;
  for (let [r, a] of Object.entries(i))
    a.length > 0 &&
      (calcWalkTime && (a = a.filter((e) => e > 7)),
      a.length > 0 &&
        (a = a.sort(function (e, i) {
          return e - i;
        }))[0] < n &&
        ((n = a[0]), (t = r)));
  let o = e.senlac.findIndex(function (e) {
    return e > 16 + parseInt(n);
  });
  o = parseInt((o = e.senlac[o])) - 14 - parseInt(n);
  let l = (e) => null != e && !isNaN(e);
  l(t) && l("98")
    ? ((document.getElementById(
        "overviewSenlacPath"
      ).innerHTML = `Best Route: ${t} + 98`),
      (document.getElementById("overviewSenlacTime").innerHTML = `Wait Time: ${
        parseInt(n) + parseInt(o)
      }m`),
      (document.getElementById(
        "overviewSenlacSplit"
      ).innerHTML = `Split Times: ${n}m + 14m + ${o}m + 4m`),
      (document.getElementById(
        "overviewSenlacTotalTime"
      ).innerHTML = `Route Time: ${parseInt(n) + 14 + parseInt(o) + 4}m`))
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
function timestamp() {
  document.getElementById("timestamp").innerHTML = `${time.toLocaleTimeString(
    "en-CA",
    { hour12: !1 }
  )}, ${
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][time.getDay()]
  }, ${time.toLocaleString("default", { month: "long" })} ${time.getDate()}`;
}
function timesAge() {
  let e = Date.now() - start,
    i = Math.floor((e / 6e4) % 60),
    t = Math.floor((e / 36e5) % 24),
    n = Math.floor(e / 864e5),
    r = "";
  n > 0 && (r += `${n}d `),
    (t > 0 || n > 0) && (r += `${t}h `),
    (i > 0 || t > 0 || n > 0) && (r += `${i}m `),
    (r += `${Math.floor((e / 1e3) % 60)}s ago`),
    (document.getElementById("timesAge").innerHTML = r);
}
function resetTimestamp() {
  (start = Date.now()), (time = new Date()), timestamp(), timesAge();
}
loadFinchOverview(),
  loadSenlacOverview(),
  loadTimes(),
  refreshButton(),
  timestamp(),
  walkTimeToggle(),
  setInterval(() => {
    timesAge();
  }, 1),
  calcWalkTime
    ? (document.getElementById("walkToggle").style.backgroundColor = "#383838")
    : (document.getElementById("walkToggle").style.backgroundColor = "grey");
