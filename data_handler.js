
let baseUrl = "https://api.synopticlabs.org/v2/stations/statistics?&token=demotoken&country=us&state=ia";
let variables = "&vars=road_subsurface_tmp,peak_wind_speed,snow_depth,snow_accum,visibility,weather_cond_code," +
    "road_surface_condition,wind_speed,wind_gust,road_temp,friction_velocity";

//Spinner settings
let spinnerSettings = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1.3, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#ffffff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    opacity: 0.60, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: 'none', // Box-shadow for the lines
    position: 'absolute' // Element positioning
};

let compressor = d3.scaleLinear()
    .domain([1, 5])
    .range([0, 1]);

for(let sev = 1; sev <= 5; sev++)
{
    d3.select("#sev" + sev)
        .style("fill", d3.interpolateOranges(compressor(sev)));
}

d3.csv("data/Crash_Data_2015.csv").then(function (crashes) {
    window.csvCrashes = crashes;
    updatePlot();
});

function updatePlot() {
    let selectedMonth = d3.select("#months").node().value;
    window.crashStats = new CrashStats(getCrashesFor(selectedMonth));
    crashStats.plot();
    crashStats.clearSelected();
}

function getCrashesFor(month) {

    let monthCrashes = [];
    window.monthCrashDates = new Set();

    let encounteredMonth = false;

    for(let crashIndex = 0; crashIndex < csvCrashes.length; crashIndex++)
    {
        if(csvCrashes[crashIndex].CRASH_MONTH == month)
        {
            if(!encounteredMonth)
                encounteredMonth = true;

            monthCrashes.push(csvCrashes[crashIndex]);
            monthCrashDates.add(csvCrashes[crashIndex].CRASH_DATE);
        }

        if(encounteredMonth && csvCrashes[crashIndex].CRASH_MONTH != month)
            break;
    }

    return monthCrashes;
}

function getEnvironmentDataFor(crash) {

    let target = document.getElementById('crashStats');
    let spinner = (new Spinner(spinnerSettings)).spin(target);

    let startDate, endDate;

    if(moment(crash.TIMESTR, "HH:mm") <= moment("00:05", "HH:mm"))
        startDate = moment(crash.CRASH_DATE).subtract(1, 'day').format("YYYYMMDD");
    else
        startDate = crash.CRASH_DATE.replace(/-/g,"");

    if(moment(crash.TIMESTR, "HH:mm") >= moment("23:55", "HH:mm"))
        endDate = moment(crash.CRASH_DATE).add(1, 'day').format("YYYYMMDD");
    else
        endDate = crash.CRASH_DATE.replace(/-/g,"");

    let startTime = moment(crash.TIMESTR, "HH:mm").subtract(5, 'minutes').format("HHmm"),
        endTime = moment(crash.TIMESTR, "HH:mm").add(5, 'minutes').format("HHmm");

    //Construct API request
    let apiRequest = baseUrl + "&radius=" + crash.LATITUDE + "," + crash.LONGITUDE + ",25&limit=1&start=" + startDate
        + startTime + "&end=" + endDate + endTime + "&type=average" + variables;

    d3.json(apiRequest).then(function (apiResponse) {

        let stats = "";

        if(Object.keys(apiResponse.UNITS).length > 0)
        {
            Object.keys(apiResponse.UNITS).forEach(function (variable) {

                let statistics_set1 = apiResponse.STATION[0].STATISTICS[variable + "_set_1"];
                let statistics_set2 = apiResponse.STATION[0].STATISTICS[variable + "_set_2"];
                let statistics_set3 = apiResponse.STATION[0].STATISTICS[variable + "_set_3"];

                if(statistics_set1)
                    stats += variable + ": " + statistics_set1.average + " (" + apiResponse.UNITS[variable] +")\n";
                else if(statistics_set2)
                    stats += variable + ": " + statistics_set2.average + " (" + apiResponse.UNITS[variable] +")\n";
                else if(statistics_set3)
                    stats += variable + ": " + statistics_set3.average + " (" + apiResponse.UNITS[variable] +")\n";
                else
                    stats = "Statistics not available for this crash";
            })
        }
        else
            stats = "Statistics not available for this crash";

        //crash.STATS = stats;

        let analysisText = "Crash data from Iowa DOT\n-----------------------------" + "\nCase Number: " +
            crash.CASENUMBER + "\nDate: " + crash.CRASH_DATE + "\nTime: " + crash.TIMESTR + "\nLocation: " +
            crash.LATITUDE + " (LAT), " + crash.LONGITUDE + " (LON)" + "\nSeverity: " + crash.CSEV + "\n\n";

        let analysisDiv = document.getElementsByClassName("modal-body")[0];
        analysisDiv.innerText = analysisText + "Nearby sensor observations from MesoWest/SynopticLabs\n--------------" +
            "--------------------------------------------------\n" + stats;
        $('#analysisModal').modal('show');

        spinner.stop();
    });
}