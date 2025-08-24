let baseURL = "https://p-p.redbull.com/rb-wrccom-lintegration-yv-prod/api";
let infoLog = [];

let getAPIInfo = async function (params) {
  let response;
  let data;
  try {
    response = await fetch("".concat(baseURL, params));
    data = await response.json();
  } catch (error) {
    console.error(error);
  }
  return data;
};

function getData() {
  getAPIInfo("/seasons.json").then((data) => {
    data = data.filter((item) => {
      return item.name.includes("World Rally Championship");
    });
    data = data.filter((item) => item.year === new Date().getFullYear());
    if (data.length > 0) {
      getAPIInfo(
        "".concat("/season-detail.json?seasonId=", data[0].seasonId)
      ).then(async (details) => {
        // Run all rounds in parallel
        const roundPromises = details.seasonRounds.map(async (round) => {
          let stages = [];
          let eventData = await getAPIInfo(
            "".concat("/events/", round.eventId, ".json")
          );
          let rallyName = eventData.name;
          let itineraryId = eventData.rallies[0].itineraryId;
          if (round.eventId) {
            let itinerary = await getAPIInfo(
              "".concat(
                "/events/",
                round.eventId,
                "/itineraries/",
                itineraryId,
                ".json"
              )
            );
            let stageControls = [];
            itinerary.itineraryLegs.forEach((leg) => {
              leg.itinerarySections.forEach((section) => {
                section.stages.forEach((stage) => {
                  stages.push(stage.code);
                });
                if (itineraryId != []) {
                  let legControls = section.controls.filter((item) => {
                    return stages.includes(item.code);
                  });
                  legControls.forEach((control) => {
                    stageControls.push(control);
                  });
                }
              });
            });
            let roundLog = [];
            if (stageControls.length > 0) {
              stageControls.forEach((control) => {
                roundLog.push([
                  control.code,
                  control.location,
                  control.firstCarDueDateTime,
                  control.targetDuration,
                ]);
              });
            } else {
              roundLog.push("No Stages");
            }
            return {
              order: round.order,
              log: [`${round.order}: ${rallyName}`, roundLog],
            };
          }
        });
        const allRounds = await Promise.all(roundPromises);
        allRounds
          .filter(Boolean)
          .sort((a, b) => a.order - b.order)
          .forEach((round) => infoLog.push(round.log));

        // Display infoLog in the "body" id element
        function renderInfoLog(infoLog) {
          const bodyElem = document.getElementById("body");
          if (bodyElem) {
            bodyElem.innerHTML = infoLog
              .map(
                (log) =>
                  `<div><strong>${log[0]}</strong>` +
                  `<table border="1" cellpadding="4" cellspacing="0" style="margin-bottom:1em;"><thead><tr><th>Code</th><th>Location</th><th>First Car Due</th><th>Event Time</th></tr></thead><tbody>` +
                  log[1]
                    .map((item) =>
                      Array.isArray(item)
                        ? `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`
                        : `<tr><td colspan="4">${item}</td></tr>`
                    )
                    .join("") +
                  "</tbody></table></div>"
              )
              .join("");
          }
        }

        renderInfoLog(infoLog);
        console.log(infoLog);
      });
    } else {
      console.log("No matching season found.");
    }
  });
}

getData();
