# [Crash statistics visualization](https://mohammed-musaddiq.github.io/crash-stats-viz/)

I found these interesting APIs [here](https://synopticlabs.org/api/products/) that provide past as well as
 ongoing observations from sensors present at various locations, giving real-time data on climatological queries.

Wondering about a good way to utilize this source of data, I came across the State of Iowa's crash 
data [here](https://catalog.data.gov/dataset/crash-data) and wanted to use the APIs mentioned above to explore 
the impact of environmental conditions on crash incidents. To elaborate, the API when queried with date, time and 
location of a crash, returns statistics (such as the average, median, maximum values) pertaining to variables (like 
road temperature, visibility, wind speed etc).

According to the FHWA's webpage on [this topic](https://ops.fhwa.dot.gov/weather/q1_roadimpact.htm), weather events 
like wind speed can impact -
* Visibility distance (due to blowing snow, dust)
* Lane obstruction (due to wind-blown snow, debris)

which in turn pose accident risks. So I went ahead and visualized all crashes in the year 2015 in Iowa, pulling 
the climatological data for each (if available, within a 25 mile radius of the crash site and 10 minute time interval) 
via the APIs and putting these together with the Iowa DOT's crash metadata, I made observations such as the following -

> Crash data from Iowa DOT
--------------------------
    Time: 18:15
    Location: 40.881540263226526 (LAT), -94.55901803997088 (LON)
    Crash Severity: 5
  
> Nearby sensor observations (via the MesoWest/SynopticLabs API)
----------------------------------------------------------------
    wind_speed: 4.63 (m/s)
    weather_cond_code: 31 (code)
    visibility: 0.75 (Statute miles)
    
Based on the above statistics, the low visibility could have been a possible factor for this crash. Of course, there 
could also be other non-environmental factors involved such as distracted driving, influence of alcohol etc but 
nevertheless, it is interesting to analyze from a climatological perspective too. 
[Explore and see for yourself!](https://mohammed-musaddiq.github.io/crash-stats-viz/crash_stats.html) 
