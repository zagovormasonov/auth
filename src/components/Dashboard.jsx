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
    const updateLastLogin = async () => {
      if (user) {
        await supabase
          .from("users") // Таблица пользователей в Supabase
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
      }
    };
  
    updateLastLogin();
  }, [user]);

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
        const apiKey = "74e0778d44f33af174a08066b01b209a"; // Подставь свой ключ API
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=ru`
        );
        setWeather(response.data);
        setError(null); // Очищаем ошибку, если запрос успешен
      } catch (err) {
        setError("Не удалось загрузить погоду по вашему запросу.");
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
      <p>Последний вход: {new Date(user?.last_login).toLocaleString()}</p>

        {/* Форма для изменения города */}
        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Введите город"
          />
        </div>

        {/* Блок с погодой */}
        {weather ? (
          <div className="result">
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