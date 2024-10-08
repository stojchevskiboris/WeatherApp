let headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append('Access-Control-Allow-Origin', '*');
var flag = 0;
var page = 1


$(document).ready(function () {
    $("#btn").click(function () {
        document.getElementById("footer1").scrollIntoView({ block: 'end', behavior: 'auto' })
    })

    setTimeout(() => {
        document.getElementById("loc").click()
    }, 2000)


    $("#add").click(async function myfunc() {
        document.getElementById("cityInput").blur()
        var er2 = document.getElementById("error2")
        let city = $("#cityInput").val()
        if (city == "") {
            er2.classList.remove("displayNone")
            er2.classList.add("displayBlock")
            return
        }
        er2.classList.remove("displayBlock")
        er2.classList.add("displayNone")

        if (flag == 1) {
            city = "Resen, Macedonia"
            flag = 0
        }

        // https://api.weatherapi.com/v1/forecast.json?key=19a1d968ac214ba2b3d195557233001&q=%27resen%20mkd%27&days=9&aqi=yes&alerts=no
        let url = 'https://api.weatherapi.com/v1/forecast.json?key=19a1d968ac214ba2b3d195557233001&q=' + city + '&days=9&aqi=yes&alerts=no'
        let request = new Request(url, {
            method: 'GET',
            headers: headers
        });
        let result = await fetch(request);
        let response = await result.json();


        // let forecast = response;

        setTimeout(() => {
            if (response.hasOwnProperty("error")) {
                var elm = document.getElementById("error")
                elm.classList.remove("displayNone")
                elm.classList.add("displayBlock")
                setTimeout(() => {
                    elm.classList.remove("displayBlock")
                    elm.classList.add("displayNone")
                }, 20000)
                return
            } else {
                var elm = document.getElementById("error")
                elm.classList.remove("displayBlock")
                elm.classList.add("displayNone")
                weatherSelect(response)
            }

        }, 200)


    })

    function weatherSelect(json) {
        // console.log(json)
        document.getElementById("selectedCity").style.display = "block"
        // First Card
        document.getElementById("t1").innerText = json.location.name + ", " + json.location.country
        document.getElementById("t2").innerText = json.location.localtime.slice(-5)
        document.getElementById("t3").innerText = json.current.temp_c + "°"
        document.getElementById("c4img").src = json.current.condition.icon
        document.getElementById("t4").innerText = json.current.condition.text

        // Second Card
        document.getElementById("t5").innerText = json.location.name + ", " + json.location.country
        document.getElementById("t6").innerText = json.current.feelslike_c + "°"
        document.getElementById("t7").innerText = json.forecast.forecastday[0].day.maxtemp_c + "° / " + json.forecast.forecastday[0].day.mintemp_c + "°"
        document.getElementById("t8").innerText = json.current.humidity + "%"
        document.getElementById("t9").innerText = json.current.pressure_mb + " mb"
        document.getElementById("t10").innerText = json.current.vis_km + " km"
        document.getElementById("t11").innerText = json.current.wind_kph + " km/h"
        document.getElementById("t12").innerText = json.current.uv + " of 10"
        document.getElementById("t13").innerText = json.current.cloud + "%"
        document.getElementById("t14").innerText = json.current.precip_mm + " mm/h"

        // Air Quality
        document.getElementById("t15").innerText = json.current.air_quality.co.toFixed(2) + " μg/m³"
        document.getElementById("t16").innerText = json.current.air_quality.no2.toFixed(2) + " μg/m³"
        document.getElementById("t17").innerText = json.current.air_quality.o3.toFixed(2) + " μg/m³"
        document.getElementById("t18").innerText = json.current.air_quality.so2.toFixed(2) + " μg/m³"
        document.getElementById("t19").innerText = json.current.air_quality.pm2_5.toFixed(2) + " μg/m³"
        document.getElementById("t20").innerText = json.current.air_quality.pm10.toFixed(2) + " μg/m³"
        document.getElementById("t21").innerText = json.current.air_quality["us-epa-index"]
        document.getElementById("t22").innerText = json.current.air_quality["gb-defra-index"]

        document.getElementById("airButton").onclick = function () {
            var display = document.getElementById("airQ").style.display
            if (display == 'flex')
                document.getElementById("airQ").style.display = "none"
            else
                document.getElementById("airQ").style.display = "flex"
        }

        var el = document.getElementById("cb1")
        var is_day = json.current.is_day
        if (is_day == 0) {
            el.classList.remove("day")
            el.classList.add("night")
        } else {
            el.classList.remove("night")
            el.classList.add("day")
        }
        updateHourlyForecast(json);
    }

    function updateHourlyForecast(json) {
        const hourlyForecastContent = document.getElementById('hourlyForecastContent');
        hourlyForecastContent.innerHTML = ''; // Clear existing content

        // Iterate over each forecast day
        json.forecast.forecastday.forEach(day => {
            // Add the date header
            const dateHeader = document.createElement('h5');
            dateHeader.className = 'date-header mt-4 mb-2 ms-3';
            dateHeader.innerText = new Date(day.date).toDateString();
            hourlyForecastContent.appendChild(dateHeader);

            // Add labels for the hourly data
            const labelsDiv = document.createElement('div');
            labelsDiv.className = 'labels d-flex justify-content-between align-items-center border-bottom pb-2 mb-2 ms-3 me-3';
            labelsDiv.innerHTML = `
            <span class="label-time fw-bold">Time</span>
            <span class="label-temp fw-bold">Temperature</span>
            <span class="label-condition fw-bold">Condition</span>
            <span class="label-wind fw-bold">Wind</span>
            <span class="label-precip fw-bold">Rain %</span>
        `;
            hourlyForecastContent.appendChild(labelsDiv);
            // Iterate over each hour
            day.hour.forEach(hour => {
                const hourDiv = document.createElement('div');
                hourDiv.className = 'hourly-item d-flex justify-content-between align-items-center border-bottom pb-2 mb-2';

                hourDiv.innerHTML += `
                    <span class="hour-time">${hour.time.slice(-5)}</span>
                    <span class="hour-temp">${hour.temp_c}°C</span>
                    <span class="hour-condition">
                        <img src="${hour.condition.icon}" alt="${hour.condition.text}" width="30" height="30"/>
                        ${hour.condition.text}
                    </span>
                    <span class="hour-wind">${hour.wind_kph} km/h</span>
                    <span class="hour-precip">${hour.chance_of_rain}%</span>
                `;

                hourlyForecastContent.appendChild(hourDiv);
            });
        });

        // Show the hourly forecast section
        document.getElementById('hourlyForecast').style.display = 'block';
    }


    let input = document.getElementById("cityInput");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("cityInput").blur()
            document.getElementById("add").click();
        }
    });


    const news2 = async () => {
        let response;
        let yesterday = new Date(Date.now() - 90000000).toLocaleString('sv').slice(0, 10)
        const api0 = 'a09f777fe4dd48d897110afa7c6718cb';
        const api1 = '9c6af65eb2604cf3adb6d23c77fdbe4e';
        const api2 = 'e76922ff429b47e08f0fec14509aed2f';
        const api3 = '6d9a728b40ea4600a9374e384982abca';
        const api4 = 'a8bf0d174095465c8faeec59f0b4b28b';
        const api5 = '97e48b2242ca46ceb343b4a6b2bdfb4e';
        const api6 = '9ddfce1d20154283aaa212515a834567';
        const api7 = 'c4e8337a85db4dbe836a6d607ed73399';
        const api8 = '1aa9a32e450144ad930fd83c0adee49b';
        const api9 = '3886527bc8154d1db03f6aabd63c4bdb';
        var api = "";
        var num = Math.random().toString().slice(-1)

        if (num == "0") {
            api = api0
        } else if (num == "1") {
            api = api1
        } else if (num == "2") {
            api = api2
        } else if (num == "3") {
            api = api3
        } else if (num == "4") {
            api = api4
        } else if (num == "5") {
            api = api5
        } else if (num == "6") {
            api = api6
        } else if (num == "7") {
            api = api7
        } else if (num == "8") {
            api = api8
        } else {
            api = api9
        }

        // https://api.worldnewsapi.com/search-news?api-key=a8bf0d174095465c8faeec59f0b4b28b&text=weather&earliest-publish-date=%272023-05-21%27
        let URL = 'https://api.worldnewsapi.com/search-news?api-key=' + api + '&text=climate&earliest-publish-date=' + yesterday;
        await fetch(URL)
            .then(async (r) => {
                response = await r.json();
            })

        let newsArr = response.news;
        let text = ""
        for (let x in newsArr) {
            var description = newsArr[x].text.slice(0, 400) + '... ' + "<a href = " + newsArr[x].url + " target=”_blank”>Continue reading</a>"
            var newsDate = newsArr[x].publish_date.slice(0, 10)
            text +=
                "<div class='card'>" +
                "<a href='" + newsArr[x].url + "' target=”_blank”> <img class='card-img-top card-img-custom' src='" + newsArr[x].image + "' alt='Image not available'></a>" +
                "<div class='card-body'>" +
                "<a href='" + newsArr[x].url + "' target=”_blank”><h5 class='card-title'>" + newsArr[x].title + "</h5></a>" +
                "<p class='card-text'>" + description + "</p>" +
                "<p class='card-text'><small class='text-muted'>" + '1 day ago, ' + newsDate.slice(8, 10) + "." + newsDate.slice(5, 7) + "." + newsDate.slice(0, 4) + "</small></p>" +
                "</div></div><br>"
        }
        document.getElementById("newsDiv").innerHTML = text
    }

    const news2_2 = async () => {
        let response;
        let twoDaysAgo = new Date(Date.now() - 180000000).toLocaleString('sv').slice(0, 10)
        const api0 = 'a09f777fe4dd48d897110afa7c6718cb';
        const api1 = '9c6af65eb2604cf3adb6d23c77fdbe4e';
        const api2 = 'e76922ff429b47e08f0fec14509aed2f';
        const api3 = '6d9a728b40ea4600a9374e384982abca';
        const api4 = 'a8bf0d174095465c8faeec59f0b4b28b';
        const api5 = '97e48b2242ca46ceb343b4a6b2bdfb4e';
        const api6 = '9ddfce1d20154283aaa212515a834567';
        const api7 = 'c4e8337a85db4dbe836a6d607ed73399';
        const api8 = '1aa9a32e450144ad930fd83c0adee49b';
        const api9 = '3886527bc8154d1db03f6aabd63c4bdb';
        var api = "";
        var num = Math.random().toString().slice(-1)

        if (num == "0") {
            api = api0
        } else if (num == "1") {
            api = api1
        } else if (num == "2") {
            api = api2
        } else if (num == "3") {
            api = api3
        } else if (num == "4") {
            api = api4
        } else if (num == "5") {
            api = api5
        } else if (num == "6") {
            api = api6
        } else if (num == "7") {
            api = api7
        } else if (num == "8") {
            api = api8
        } else {
            api = api9
        }

        // https://api.worldnewsapi.com/search-news?api-key=a8bf0d174095465c8faeec59f0b4b28b&text=weather&earliest-publish-date=%272023-05-21%27
        let URL = 'https://api.worldnewsapi.com/search-news?api-key=' + api + '&text=climate&earliest-publish-date=' + twoDaysAgo;
        await fetch(URL)
            .then(async (r) => {
                response = await r.json();
            })

        let newsArr = response.news;
        let text = ""
        for (let x in newsArr) {
            var description = newsArr[x].text.slice(0, 400) + '... ' + "<a href = " + newsArr[x].url + " target=”_blank”>Continue reading</a>"
            var newsDate = newsArr[x].publish_date.slice(0, 10)
            text +=
                "<div class='card'>" +
                "<a href='" + newsArr[x].url + "' target=”_blank”> <img class='card-img-top card-img-custom' src='" + newsArr[x].image + "' alt='Image not available'></a>" +
                "<div class='card-body'>" +
                "<a href='" + newsArr[x].url + "' target=”_blank”><h5 class='card-title'>" + newsArr[x].title + "</h5></a>" +
                "<p class='card-text'>" + description + "</p>" +
                "<p class='card-text'><small class='text-muted'>" + '2 day ago, ' + newsDate.slice(8, 10) + "." + newsDate.slice(5, 7) + "." + newsDate.slice(0, 4) + "</small></p>" +
                "</div></div><br>"
        }
        document.getElementById("newsDiv2").innerHTML = text
    }

    document.getElementById("p2").onclick = function p2Click() {
        page = 2
        document.getElementById("newsDiv").classList.add("displayNone")
        document.getElementById("newsDiv").classList.remove("displayBlock")

        document.getElementById("newsDiv2").classList.add("displayBlock")
        document.getElementById("newsDiv2").classList.remove("displayNone")

        document.getElementById("p1li").classList.remove("active")
        document.getElementById("p2li").classList.add("active")
    }

    document.getElementById("p1").onclick = function p1Click() {
        page = 1
        document.getElementById("newsDiv").classList.remove("displayNone")
        document.getElementById("newsDiv").classList.add("displayBlock")

        document.getElementById("newsDiv2").classList.remove("displayBlock")
        document.getElementById("newsDiv2").classList.add("displayNone")

        document.getElementById("p2li").classList.remove("active")
        document.getElementById("p1li").classList.add("active")
    }

    document.getElementById("prev").onclick = function () {
        if (page == 2) {
            page = 1
            document.getElementById("newsDiv").classList.remove("displayNone")
            document.getElementById("newsDiv").classList.add("displayBlock")
            document.getElementById("newsDiv2").classList.remove("displayBlock")
            document.getElementById("newsDiv2").classList.add("displayNone")
            document.getElementById("p2li").classList.remove("active")
            document.getElementById("p1li").classList.add("active")
        }
        return
    }
    document.getElementById("next").onclick = function () {
        if (page == 1) {
            page = 2
            document.getElementById("newsDiv").classList.add("displayNone")
            document.getElementById("newsDiv").classList.remove("displayBlock")
            document.getElementById("newsDiv2").classList.add("displayBlock")
            document.getElementById("newsDiv2").classList.remove("displayNone")
            document.getElementById("p1li").classList.remove("active")
            document.getElementById("p2li").classList.add("active")
        }
        return
    }


    news2();
    news2_2();


    var loc = "https://ipapi.co/"
    let t1 = ''
    let t2 = ''
    let locJson
    fetch('https://api.ipify.org/?format=json')
        .then((res) => res.json())
        .then((data) => {
            t1 = data.ip.toString()
        })


    // https://ipapi.co/95.180.230.111/json/

    var btn2 = document.getElementById("add")


    document.getElementById("loc").onclick = function () {
        document.getElementById("cityInput").readOnly = true
        document.getElementById("cityInput").classList.add("gray")
        document.getElementById("cityInput").value = "Searching..."

        // setTimeout(() => {
        //     t2 = loc + t1 + "/json"
        //     console.log(t2)
        //     fetch(t2)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             setTimeout(() => {
        //                 //console.log(locJson)
        //                 var inp = data.city + ", " + data.country
        //                 document.getElementById("cityInput").readOnly = false
        //                 if (inp == "undefined, undefined")
        //                     return
        //                 document.getElementById("cityInput").classList.remove("gray")
        //                 document.getElementById("cityInput").value = inp
        //                 setTimeout(() => {
        //                     btn2.click()
        //                     document.getElementById("cityInput").blur()
        //                 }, 500)
        //             }, 200)
        //         })
        //
        // }, 700)
        var lat = ""
        var long = ""
        const http = new XMLHttpRequest();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                lat = position.coords.latitude
                long = position.coords.longitude
                // lat = "40.9896026"
                // long = "20.9152144"
            },
                (err) => {
                    alert("Please allow location access")
                    document.getElementById("cityInput").value = ''
                })
        } else {
            alert("Geolocation is not supported by your browser");
            document.getElementById("cityInput").value = ''
        }

        setTimeout(() => {
            // let url = `https://geocode.maps.co/search?q=${lat}%20${long}`
            let url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=e2647227b3c44fceadfd964d38860d95`
            fetch(url)
                .then((response) => response.json())
                .then(data => {
                    // console.log(lat)
                    // console.log(long)
                    // console.log(data.features[0].properties.city)
                    // console.log(data.features[0].properties.country)
                    setTimeout(() => {
                        document.getElementById("cityInput").readOnly = false
                        document.getElementById("cityInput").classList.remove("gray")
                        // var loc = data[0].display_name
                        var loc = data.features[0].properties.city + " " + data.features[0].properties.country
                        if (data.features[0].properties.country == 'North Macedonia') {
                            var fix = ''
                            for (var i = 0; i < loc.length; i++) {
                                if (i + 1 < loc.length) {
                                    if ((loc[i] == 's' || loc[i] == 'S') && loc[i + 1] == 'h') {
                                        fix = loc.slice(0, i + 1) + loc.slice(i + 2, loc.length)
                                    }
                                }
                            }
                            if (fix != '')
                                loc = fix
                        }

                        document.getElementById("cityInput").value = loc
                        setTimeout(() => {
                            btn2.click()
                            document.getElementById("cityInput").blur()
                        }, 200)
                    }, 200)
                })
        }, 200)
        setTimeout(() => {
            if (document.getElementById("cityInput").value == 'Searching...')
                document.getElementById("loc").click()
        }, 2000)
    }


})

function removeDuplicates(arr) {
    return arr.filter((a, b) => arr.indexOf(a) === b);
}

async function inAuto() {
    let cities = [];
    let q = $("#cityInput").val()
    if (q == "") return;
    let url = 'https://api.weatherapi.com/v1/search.json?key=19a1d968ac214ba2b3d195557233001&q=' + q
    let request = new Request(url, {
        method: 'GET',
        headers: headers
    });
    let result = await fetch(request);
    let response = await result.json();
    let j = response.length;
    if (q.toLowerCase() == "r" || q.toLowerCase() == "re" || q.toLowerCase() == "res" || q.toLowerCase() == "rese" || q.toLowerCase() == "resen")
        cities.push("Resen, Macedonia")
    for (i = 0; i < j; i++) {
        cities.push(response[i].name + ", " + response[i].country)
    }
    cities = removeDuplicates(cities);


    for (var x in cities) {
        if (cities[x] == "Resen, Macedonia") {
            var tmp = cities[0]
            cities[0] = 'Resen, Macedonia'
            cities[x] = tmp
        }
    }

    if (cities[0] == "Resen, Macedonia")
        flag = 1;
    else flag = 0;
    var btn1 = document.getElementById("add")
    $("#cityInput").autocomplete({
        source: cities,
        select: function (event, ui) { //ui.item.label
            if (ui.item.label != "Resen, Macedonia")
                flag = 0
            document.getElementById("cityInput").innerText = ui.item.label
            setTimeout(() => {
                btn1.click()
                document.getElementById("cityInput").blur()
            }, 100)

        }

    })

}
