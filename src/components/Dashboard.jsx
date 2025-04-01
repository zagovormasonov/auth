import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Moscow"); // Установи свой город по умолчанию
  const [error, setError] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);


  useEffect(() => {
    const fetchLogins = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("logins")
          .select("sign_in_at")
          .eq("user_id", user.id)
          .order("sign_in_at", { ascending: true });
  
        if (data) {
          // Группируем данные по дням
          const groupedData = data.reduce((acc, item) => {
            const date = new Date(item.sign_in_at).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
  
          // Преобразуем в массив для графика
          const chartData = Object.keys(groupedData).map((date) => ({
            date,
            logins: groupedData[date],
          }));
  
          setLoginHistory(chartData);
        }
      }
    };
  
    fetchLogins();
  }, [user]);


  useEffect(() => {
    const saveLogin = async () => {
      if (user) {
        await supabase.from("logins").insert([{ user_id: user.id }]);
      }
    };
  
    saveLogin();
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
      <p>Последний вход: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Нет данных"}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={loginHistory}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="logins" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

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