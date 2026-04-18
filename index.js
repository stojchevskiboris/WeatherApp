/* ===== CONFIG ===== */
const MS_PER_DAY   = 86400000; /* milliseconds in one day */
const WEATHER_KEY  = '19a1d968ac214ba2b3d195557233001';
const GEO_KEY      = 'e2647227b3c44fceadfd964d38860d95';
const NEWS_KEYS    = [
    'a09f777fe4dd48d897110afa7c6718cb',
    '9c6af65eb2604cf3adb6d23c77fdbe4e',
    'e76922ff429b47e08f0fec14509aed2f',
    '6d9a728b40ea4600a9374e384982abca',
    'a8bf0d174095465c8faeec59f0b4b28b',
    '97e48b2242ca46ceb343b4a6b2bdfb4e',
    '9ddfce1d20154283aaa212515a834567',
    'c4e8337a85db4dbe836a6d607ed73399',
    '1aa9a32e450144ad930fd83c0adee49b',
    '3886527bc8154d1db03f6aabd63c4bdb'
];

/* ===== UTILITIES ===== */
function $(id) { return document.getElementById(id); }

function showError(id, ms) {
    var el = document.getElementById(id);
    el.classList.remove('hidden');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () { el.classList.add('hidden'); }, ms || 6000);
}

function hideError(id) {
    document.getElementById(id).classList.add('hidden');
}

function randomNewsKey() {
    return NEWS_KEYS[Math.floor(Math.random() * NEWS_KEYS.length)];
}

/* ===== WEATHER ===== */
async function fetchWeather(query) {
    var url = 'https://api.weatherapi.com/v1/forecast.json?key=' + WEATHER_KEY
            + '&q=' + encodeURIComponent(query)
            + '&days=3&aqi=yes&alerts=no';
    var res = await fetch(url);
    return res.json();
}

function displayWeather(data) {
    var loc      = data.location;
    var cur      = data.current;
    var forecast = data.forecast.forecastday;
    var aq       = cur.air_quality;

    /* Main card */
    $('cityName').textContent      = loc.name + ', ' + loc.country;
    $('localTime').textContent     = loc.localtime.slice(-5);
    $('tempDisplay').textContent   = cur.temp_c + '\u00b0';
    $('weatherIcon').src           = cur.condition.icon;
    $('weatherCondition').textContent = cur.condition.text;

    var body = $('mainCardBody');
    body.className = 'main-card-body ' + (cur.is_day ? 'is-day' : 'is-night');

    /* Details card */
    $('cityNameDetails').textContent = loc.name + ', ' + loc.country;
    $('feelsLike').textContent        = cur.feelslike_c + '\u00b0';
    $('highLow').textContent          = forecast[0].day.maxtemp_c + '\u00b0 / ' + forecast[0].day.mintemp_c + '\u00b0';
    $('humidity').textContent         = cur.humidity + '%';
    $('pressure').textContent         = cur.pressure_mb + ' mb';
    $('visibility').textContent       = cur.vis_km + ' km';
    $('wind').textContent             = cur.wind_kph + ' km/h';
    $('uvIndex').textContent          = cur.uv + ' / 10';
    $('clouds').textContent           = cur.cloud + '%';
    $('precipitation').textContent    = cur.precip_mm + ' mm/h';

    /* Air quality */
    $('aqCO').textContent    = aq.co.toFixed(2)    + ' \u03bcg/m\u00b3';
    $('aqNO2').textContent   = aq.no2.toFixed(2)   + ' \u03bcg/m\u00b3';
    $('aqO3').textContent    = aq.o3.toFixed(2)    + ' \u03bcg/m\u00b3';
    $('aqSO2').textContent   = aq.so2.toFixed(2)   + ' \u03bcg/m\u00b3';
    $('aqPM25').textContent  = aq.pm2_5.toFixed(2) + ' \u03bcg/m\u00b3';
    $('aqPM10').textContent  = aq.pm10.toFixed(2)  + ' \u03bcg/m\u00b3';
    $('aqEPA').textContent   = aq['us-epa-index'];
    $('aqDefra').textContent = aq['gb-defra-index'];

    /* Forecast */
    renderForecast(forecast);

    /* Show sections */
    $('weatherSection').classList.remove('hidden');
    $('forecastSection').classList.remove('hidden');
    /* Reset air quality panel on new search */
    $('airQualityPanel').classList.add('hidden');
}

function renderForecast(forecastDays) {
    var container = $('forecastContent');
    container.innerHTML = '';

    forecastDays.forEach(function (day) {
        var dateStr = new Date(day.date + 'T00:00:00').toDateString();

        var header = document.createElement('div');
        header.className = 'forecast-day-header';
        header.innerHTML =
            '<span class="forecast-date">' + dateStr + '</span>' +
            '<div class="forecast-labels">' +
                '<span>Time</span>' +
                '<span>Temp</span>' +
                '<span>Condition</span>' +
                '<span>Wind</span>' +
                '<span>Rain %</span>' +
            '</div>';
        container.appendChild(header);

        day.hour.forEach(function (hour) {
            var row = document.createElement('div');
            row.className = 'forecast-row';
            row.innerHTML =
                '<span class="fc-time">'  + hour.time.slice(-5) + '</span>' +
                '<span class="fc-temp">'  + hour.temp_c + '\u00b0C</span>' +
                '<span class="fc-cond">'  +
                    '<img src="' + hour.condition.icon + '" alt="" width="28" height="28">' +
                    '<span>' + hour.condition.text + '</span>' +
                '</span>' +
                '<span class="fc-wind">'  + hour.wind_kph + ' km/h</span>' +
                '<span class="fc-rain">'  + hour.chance_of_rain + '%</span>';
            container.appendChild(row);
        });
    });
}

/* ===== GEOLOCATION ===== */
function useMyLocation(silent) {
    var input = $('cityInput');

    if (!navigator.geolocation) {
        if (!silent) alert('Geolocation is not supported by your browser.');
        return;
    }

    input.value = 'Locating\u2026';
    input.readOnly = true;
    input.classList.add('input-loading');

    navigator.geolocation.getCurrentPosition(
        function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var url = 'https://api.geoapify.com/v1/geocode/reverse?lat=' + lat
                    + '&lon=' + lon + '&apiKey=' + GEO_KEY;
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    input.readOnly = false;
                    input.classList.remove('input-loading');

                    var props  = data && data.features && data.features[0] && data.features[0].properties;
                    var city   = props && (props.city || props.town || props.village || props.county || props.state);
                    var country = props && props.country;

                    if (!city || !country) {
                        /* Fall back to raw coordinates so the weather API can still resolve */
                        input.value = lat.toFixed(4) + ',' + lon.toFixed(4);
                    } else {
                        var loc = city + ', ' + country;
                        /* Fix North Macedonia transliteration: Sh -> S */
                        if (country === 'North Macedonia') {
                            loc = loc.replace(/Sh/g, 'S').replace(/sh/g, 's');
                        }
                        input.value = loc;
                    }

                    $('searchBtn').click();
                })
                .catch(function (err) {
                    console.error('Reverse geocoding error:', err);
                    input.value = '';
                    input.readOnly = false;
                    input.classList.remove('input-loading');
                });
        },
        function (err) {
            input.value = '';
            input.readOnly = false;
            input.classList.remove('input-loading');
            /* Only show an alert if the user explicitly clicked the button (not the silent auto-attempt) */
            if (!silent && err.code !== 1 /* PERMISSION_DENIED */) {
                alert('Could not retrieve your location. Please try again.');
            }
        },
        { timeout: 10000, maximumAge: 60000 }
    );
}

/* ===== AUTOCOMPLETE ===== */
var acTimer = null;

function handleAutocomplete() {
    clearTimeout(acTimer);
    var q = $('cityInput').value.trim();
    if (!q) return;

    acTimer = setTimeout(function () {
        var url = 'https://api.weatherapi.com/v1/search.json?key=' + WEATHER_KEY
                + '&q=' + encodeURIComponent(q);
        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!Array.isArray(data)) return;
                var cities = data.map(function (r) { return r.name + ', ' + r.country; });
                /* Remove duplicates */
                cities = cities.filter(function (v, i, a) { return a.indexOf(v) === i; });

                jQuery('#cityInput').autocomplete({
                    source: cities,
                    minLength: 1,
                    select: function (event, ui) {
                        setTimeout(function () {
                            $('searchBtn').click();
                            $('cityInput').blur();
                        }, 100);
                    }
                });
            })
            .catch(function (err) { console.error('Autocomplete error:', err); });
    }, 280);
}

/* ===== NEWS ===== */
async function fetchNews(daysAgo) {
    var key  = randomNewsKey();
    var date = new Date(Date.now() - daysAgo * MS_PER_DAY).toLocaleString('sv').slice(0, 10);
    var url  = 'https://api.worldnewsapi.com/search-news?api-key=' + key
             + '&text=climate&earliest-publish-date=' + date;
    var res  = await fetch(url);
    return res.json();
}

function renderNews(articles, container) {
    if (!articles || articles.length === 0) {
        container.innerHTML = '<p class="no-news">No news available at the moment.</p>';
        return;
    }
    container.innerHTML = articles.map(function (a) {
        var raw  = (a.publish_date || '').slice(0, 10);
        var date = raw ? raw.slice(8, 10) + '.' + raw.slice(5, 7) + '.' + raw.slice(0, 4) : '';
        var desc = a.text ? a.text.slice(0, 320) + '\u2026 ' : '';
        var img  = a.image
            ? '<a href="' + a.url + '" target="_blank" rel="noopener">'
              + '<img class="news-img" src="' + a.image + '" alt="News image" loading="lazy"></a>'
            : '';
        return '<div class="news-card">'
            + img
            + '<div class="news-body">'
            + '<h3 class="news-title"><a href="' + a.url + '" target="_blank" rel="noopener">'
            + (a.title || '') + '</a></h3>'
            + '<p class="news-desc">' + desc
            + '<a href="' + a.url + '" target="_blank" rel="noopener">Continue reading</a></p>'
            + (date ? '<small class="news-date">' + date + '</small>' : '')
            + '</div></div>';
    }).join('');
}

/* ===== PAGINATION ===== */
var currentPage = 1;

function setNewsPage(page) {
    currentPage = page;
    var c1 = $('newsContainer');
    var c2 = $('newsContainer2');
    var b1 = $('page1Btn');
    var b2 = $('page2Btn');

    if (page === 1) {
        c1.classList.remove('hidden');
        c2.classList.add('hidden');
        b1.classList.add('active');
        b2.classList.remove('active');
    } else {
        c1.classList.add('hidden');
        c2.classList.remove('hidden');
        b1.classList.remove('active');
        b2.classList.add('active');
    }
}

/* ===== INIT ===== */
jQuery(document).ready(function () {
    var cityInput = $('cityInput');
    var searchBtn = $('searchBtn');

    /* Search button */
    searchBtn.addEventListener('click', async function () {
        cityInput.blur();
        var city = cityInput.value.trim();

        if (!city) {
            showError('errorEmpty');
            return;
        }
        hideError('errorEmpty');

        try {
            var data = await fetchWeather(city);
            if (data.error) {
                showError('errorMsg');
                return;
            }
            hideError('errorMsg');
            displayWeather(data);
        } catch (err) {
            console.error('Weather fetch error:', err);
            showError('errorMsg');
        }
    });

    /* Enter key */
    cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBtn.click();
        }
    });

    /* Autocomplete */
    cityInput.addEventListener('input', handleAutocomplete);

    /* Location button */
    $('locBtn').addEventListener('click', function () {
        useMyLocation(false);
    });

    /* Air quality toggle */
    $('airQualityBtn').addEventListener('click', function () {
        $('airQualityPanel').classList.toggle('hidden');
    });

    /* Pagination */
    $('page1Btn').addEventListener('click', function () { setNewsPage(1); });
    $('page2Btn').addEventListener('click', function () { setNewsPage(2); });
    $('prevPage').addEventListener('click', function () { if (currentPage > 1) setNewsPage(currentPage - 1); });
    $('nextPage').addEventListener('click', function () { if (currentPage < 2) setNewsPage(currentPage + 1); });

    /* Load news */
    var c1 = $('newsContainer');
    var c2 = $('newsContainer2');

    fetchNews(1)
        .then(function (d) { renderNews(d.news, c1); })
        .catch(function () { c1.innerHTML = '<p class="no-news">Could not load news.</p>'; });

    fetchNews(2)
        .then(function (d) { renderNews(d.news, c2); })
        .catch(function () { c2.innerHTML = '<p class="no-news">Could not load news.</p>'; });

    /* Auto-detect location on load (silently — no alert if denied) */
    useMyLocation(true);
});
