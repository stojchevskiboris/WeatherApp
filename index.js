let headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Accept', 'application/json');
headers.append('Access-Control-Allow-Origin', '*');

$(document).ready(function () {


    $("#add").click(async function myfunc(str) {
        let city = $("#cityInput").val()
        // https://api.weatherapi.com/v1/forecast.json?key=19a1d968ac214ba2b3d195557233001&q=%27resen%20mkd%27&days=9&aqi=yes&alerts=no
        let url = 'https://api.weatherapi.com/v1/forecast.json?key=19a1d968ac214ba2b3d195557233001&q=' + city + '&days=9&aqi=yes&alerts=no'
        let request = new Request(url, {
            method: 'GET',
            headers: headers
        });
        let result = await fetch(request);
        let response = await result.json();


        let forecast = response;

        setTimeout(() => {
            weatherSelect(response)
        }, 200)


    })

    function weatherSelect(json) {
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
    }

    let input = document.getElementById("cityInput");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("add").click();
        }
    });


    const news2 = async () => {
        let response;
        let yesterday = new Date(Date.now() - 90000000).toLocaleString('sv').slice(0, 10)
        const api1 = '9c6af65eb2604cf3adb6d23c77fdbe4e';
        const api2 = 'e76922ff429b47e08f0fec14509aed2f';
        const api3 = '6d9a728b40ea4600a9374e384982abca';
        const api4 = 'a8bf0d174095465c8faeec59f0b4b28b';
        var api = "";
        var num = Math.random()
        if (num < 0.25)
            api = api1;
        else if (num < 0.50)
            api = api2;
        else if (num < 0.75)
            api = api3;
        else
            api = api4

        let URL = 'https://api.worldnewsapi.com/search-news?api-key=' + api + '&text=weather&earliest-publish-date=%27' + yesterday + '%27'
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

    news2();
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
    for (i = 0; i < j; i++) {
        cities.push(response[i].name + ", " + response[i].country)
    }
    cities = removeDuplicates(cities);

    for (var x in cities){
        if(cities[x]=="Resen, Macedonia") {
            var tmp = cities[0]
            cities[0] = 'Resen, Macedonia'
            cities[x] = tmp
        }
    }
    var btn1 = document.getElementById("add")
    $("#cityInput").autocomplete({
        source: cities,
        select: function (event, ui) { //ui.item.label
            document.getElementById("cityInput").innerText = ui.item.label
            setTimeout(() => {
                btn1.click()
                document.getElementById("cityInput").blur()
            }, 100)

        }

    })

}