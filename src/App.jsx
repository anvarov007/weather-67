
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const cities = [
  "Toshkent", "Samarqand", "Buxoro",
  "Namangan", "Andijon", "Xiva"
];

const weatherInfo = {
  0: ["Quyoshli", "☀️"],
  1: ["Asosan ochiq", "🌤️"],
  2: ["Qisman bulutli", "⛅"],
  3: ["Bulutli", "☁️"],
  45: ["Tuman", "🌫️"],
  48: ["Tuman", "🌫️"],
  51: ["Mayda yomg'ir", "🌦️"],
  53: ["Yomg'ir", "🌧️"],
  55: ["Kuchli yomg'ir", "🌧️"],
  61: ["Yengil yomg'ir", "🌧️"],
  63: ["Yomg'ir", "🌧️"],
  65: ["Kuchli yomg'ir", "🌧️"],
  71: ["Qor", "🌨️"],
  73: ["Qor yog'moqda", "❄️"],
  75: ["Kuchli qor", "❄️"],
  80: ["Jala", "🌦️"],
  81: ["Yomg'ir", "🌧️"],
  82: ["Kuchli jala", "⛈️"],
  95: ["Momaqaldiroq", "⛈️"],
  96: ["Do'l", "⛈️"],
  99: ["Kuchli do'l", "⛈️"]
};

const getWeather = (code) =>
  weatherInfo[code] || ["O'zgaruvchan", "🌤️"];

function App() {
  const [city, setCity] = useState("Toshkent");
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [unit, setUnit] = useState("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);

  async function loadWeather(name) {
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=uz&format=json`
      );

      if (!geoResponse.ok) throw new Error("Shahar topilmadi");

      const geo = await geoResponse.json();

      if (!geo.results?.length) {
        throw new Error("Bunday shahar topilmadi!");
      }

      const place = geo.results[0];

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
        `&longitude=${place.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
        `&timezone=auto&forecast_days=7`;

      const response = await fetch(url);

      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");

      const weather = await response.json();

      setData({
        place,
        weather
      });

      setCity(place.name);

      setRecent(old => [
        place.name,
        ...old.filter(x => x !== place.name)
      ].slice(0, 5));

      setInput("");
    } catch (e) {
      setError(e.message || "Internet bilan bog'liq xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather("Tashkent");
  }, []);

  const current = data?.weather.current;
  const hourly = data?.weather.hourly;
  const daily = data?.weather.daily;

  const temperature = (v) =>
    unit === "C" ? Math.round(v) : Math.round(v * 9 / 5 + 32);

  const time = (date) =>
    new Date(date).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit"
    });

  const date = (value) =>
    new Date(value + "T12:00:00").toLocaleDateString("uz-UZ", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

  const aqiText = (uv) => {
    if (uv <= 2) return "Past";
    if (uv <= 5) return "O'rtacha";
    if (uv <= 7) return "Yuqori";
    return "Juda yuqori";
  };

  return (
    <div className="app">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">☀</div>
          <div>
            <h2>Sky<span>Sense</span></h2>
            <small>OB-HAVO MONITORINGI</small>
          </div>
        </div>

        <div className="nav-right">
          <span className="live"><i></i> LIVE WEATHER</span>
          <div className="unit-switch">
            <button
              className={unit === "C" ? "active" : ""}
              onClick={() => setUnit("C")}
            >°C</button>
            <button
              className={unit === "F" ? "active" : ""}
              onClick={() => setUnit("F")}
            >°F</button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="intro">
          <div>
            <span className="eyebrow">OB-HAVO MA'LUMOTLARI</span>
            <h1>Ob-havoni <span>his qiling.</span></h1>
            <p>Dunyoning istalgan nuqtasidagi ob-havoni kuzating.</p>
          </div>

          <form className="search" onSubmit={e => {
            e.preventDefault();
            loadWeather(input);
          }}>
            <span>⌕</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Shahar nomini kiriting..."
            />
            <button disabled={loading}>
              {loading ? "..." : "Qidirish"}
            </button>
          </form>
        </section>

        {error && <div className="error">⚠️ {error}</div>}

        <section className="city-list">
          <span>🇺🇿 O'ZBEKISTON:</span>
          {cities.map(c => (
            <button
              key={c}
              className={city === c ? "selected" : ""}
              onClick={() => loadWeather(c)}
            >{c}</button>
          ))}
        </section>

        {loading && !data && (
          <div className="loading">Ob-havo ma'lumotlari yuklanmoqda...</div>
        )}

        {data && current && (
          <>
            <section className="hero-card">
              <div className="hero-info">
                <div className="location">
                  <span>📍</span>
                  <div>
                    <h2>{data.place.name}</h2>
                    <p>{data.place.country || "Dunyo"} · {time(current.time)}</p>
                  </div>
                </div>

                <div className="temperature">
                  <h1>{temperature(current.temperature_2m)}°</h1>
                  <span>{unit}</span>
                </div>

                <h3>{getWeather(current.weather_code)[0]}</h3>
                <p className="feels">
                  His qilinishi: {temperature(current.apparent_temperature)}°
                </p>
              </div>

              <div className="hero-weather">
                <div className="sun-glow">
                  <span>{getWeather(current.weather_code)[1]}</span>
                </div>
                <p>Bugungi ob-havo</p>
                <small>
                  {current.is_day ? "Kunduzgi vaqt" : "Tungi vaqt"}
                </small>
              </div>

              <div className="hero-bottom">
                <span>✦ REAL-TIME WEATHER DATA</span>
                <span>Open-Meteo API</span>
              </div>
            </section>

            <section className="stats-grid">
              <Stat icon="💧" label="Namlik"
                value={`${current.relative_humidity_2m}%`}
                desc="Havodagi namlik" />

              <Stat icon="💨" label="Shamol"
                value={`${current.wind_speed_10m} km/h`}
                desc="Shamol tezligi" />

              <Stat icon="🌡️" label="Bosim"
                value={`${Math.round(current.surface_pressure)} hPa`}
                desc="Atmosfera bosimi" />

              <Stat icon="☀️" label="UV indeksi"
                value={daily.uv_index_max[0]}
                desc={aqiText(daily.uv_index_max[0])} />
            </section>

            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">SOATLIK PROGNOZ</span>
                  <h2>Keyingi 24 soat</h2>
                </div>
                <span className="section-icon">◷</span>
              </div>

              <div className="hourly-list">
                {hourly.time.slice(0, 24).filter((_, i) => i % 2 === 0).map((t) => {
                  const i = hourly.time.indexOf(t);
                  return (
                    <div className="hour-item" key={t}>
                      <span>{time(t)}</span>
                      <b>{getWeather(hourly.weather_code[i])[1]}</b>
                      <strong>{temperature(hourly.temperature_2m[i])}°</strong>
                      <small>💧 {hourly.precipitation_probability[i] ?? 0}%</small>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel forecast-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">7 KUNLIK</span>
                  <h2>Haftalik prognoz</h2>
                </div>
                <span className="section-icon">▦</span>
              </div>

              <div className="forecast-list">
                {daily.time.map((d, i) => (
                  <div className="forecast-item" key={d}>
                    <span className="forecast-date">
                      {i === 0 ? "Bugun" : date(d)}
                    </span>
                    <span className="forecast-icon">
                      {getWeather(daily.weather_code[i])[1]}
                    </span>
                    <span className="forecast-description">
                      {getWeather(daily.weather_code[i])[0]}
                    </span>
                    <div className="temp-range">
                      <span>{temperature(daily.temperature_2m_min[i])}°</span>
                      <div className="range-line">
                        <i style={{
                          left: `${Math.max(0, Math.min(85,
                            (daily.temperature_2m_min[i] + 10) * 2))}%`,
                          width: "35%"
                        }}></i>
                      </div>
                      <b>{temperature(daily.temperature_2m_max[i])}°</b>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="panel sun-panel">
                <span className="eyebrow">QUYOSH HARAKATI</span>
                <h2>Quyosh chiqishi va botishi</h2>
                <div className="sun-visual">🌅</div>
                <div className="sun-times">
                  <div>
                    <small>☀ Quyosh chiqishi</small>
                    <strong>{time(daily.sunrise[0])}</strong>
                  </div>
                  <div>
                    <small>🌇 Quyosh botishi</small>
                    <strong>{time(daily.sunset[0])}</strong>
                  </div>
                </div>
              </div>

              <div className="panel wind-panel">
                <span className="eyebrow">SHAMOL MONITORINGI</span>
                <h2>Shamol yo'nalishi</h2>
                <div className="compass">
                  <span className="north">N</span>
                  <span className="south">S</span>
                  <span className="east">E</span>
                  <span className="west">W</span>
                  <div className="compass-arrow"
                    style={{
                      transform: `rotate(${current.wind_direction_10m}deg)`
                    }}>➤</div>
                </div>
                <p>{current.wind_speed_10m} km/h · {current.wind_direction_10m}°</p>
              </div>
            </section>

            {recent.length > 0 && (
              <section className="panel recent-panel">
                <div className="section-heading">
                  <h2>Oxirgi qidiruvlar</h2>
                  <button onClick={() => setRecent([])}>Tozalash</button>
                </div>
                <div className="recent-list">
                  {recent.map(c => (
                    <button key={c} onClick={() => loadWeather(c)}>
                      📍 {c}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer>
        <div className="brand">
          <div className="brand-icon">☀</div>
          <h2>Sky<span>Sense</span></h2>
        </div>
        <p>© 2026 SkySense. Barcha huquqlar himoyalangan.</p>
        <small>Powered by Open-Meteo</small>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value, desc }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <b>{icon}</b>
      </div>
      <h2>{value}</h2>
      <small>{desc}</small>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

import "./index.css";