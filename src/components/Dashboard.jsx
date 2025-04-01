import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Moscow"); // Установи свой город по умолчанию
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login"); // Если пользователь не авторизован, перенаправляем на login
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "b1a0b23d9b2d47ed2f9ae2d6f3d2eb85"; // Подставь свой ключ API
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=ru`
        );
        setWeather(response.data);
        setError(null); // Очищаем ошибку, если запрос успешен
      } catch (err) {
        setError("Не удалось загрузить погоду. Попробуйте позже.");
        setWeather(null);
      }
    };

    fetchWeather();
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="layout">
      <span className="profile_name">{user?.email}</span>
      <button onClick={handleLogout}>Выйти</button>

        {/* Форма для изменения города */}
        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Введите город"
          />
          <button onClick={() => setLocation(location)}>Показать погоду</button>
        </div>

        {/* Блок с погодой */}
        {weather ? (
          <div>
            <h2>Погода в {weather.name}, {weather.sys.country}</h2>
            <p>Температура: {weather.main.temp}°C</p>
            <p>Ощущается как: {weather.main.feels_like}°C</p>
            <p>Влажность: {weather.main.humidity}%</p>
            <p>Скорость ветра: {weather.wind.speed} м/с</p>
            <p>Описание: {weather.weather[0].description}</p>
          </div>
        ) : (
          <p>{error ? error : "Загрузка погоды..."}</p>
        )}
    </div>
  );
};

export default Dashboard;