import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [activityByDay, setActivityByDay] = useState([]);
  const [motivationMessage, setMotivationMessage] = useState("");


  useEffect(() => {
    const analyzeActivity = () => {
      const activeWeekdays = activityByDay.filter((day) => day.logins > 0);
  
      if (activeWeekdays.length === 0) {
        setMotivationMessage("Ты не заходил в систему несколько дней. Не забывай проверять обновления!");
      } else if (activeWeekdays.length === 7) {
        setMotivationMessage("Ты активен каждый день! Отличная регулярность!");
      } else if (activeWeekdays.every((day) => day.day === "Воскресенье" || day.day === "Суббота")) {
        setMotivationMessage("Ты зашел только в выходные. Попробуй быть активнее в будние дни!");
      } else {
        setMotivationMessage("Ты заходишь в систему регулярно. Молодец!");
      }
    };
  
    analyzeActivity();
  }, [activityByDay]);


  useEffect(() => {
    const fetchLogins = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("logins")
          .select("sign_in_at")
          .eq("user_id", user.id)
          .order("sign_in_at", { ascending: true });
  
        if (data) {
          const groupedByDay = data.reduce((acc, item) => {
            // Преобразуем дату входа в объект Date
            const signInDate = new Date(item.sign_in_at);
            // Приводим время в UTC и получаем день недели (0 - воскресенье, 1 - понедельник, и так далее)
            const dayOfWeek = signInDate.getUTCDay();
            
            // Считаем количество входов для каждого дня недели
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
            return acc;
          }, {});
  
          // Преобразуем данные для отображения на графике
          const chartData = [
            { day: "Воскресенье", logins: groupedByDay[0] || 0 },
            { day: "Понедельник", logins: groupedByDay[1] || 0 },
            { day: "Вторник", logins: groupedByDay[2] || 0 },
            { day: "Среда", logins: groupedByDay[3] || 0 },
            { day: "Четверг", logins: groupedByDay[4] || 0 },
            { day: "Пятница", logins: groupedByDay[5] || 0 },
            { day: "Суббота", logins: groupedByDay[6] || 0 },
          ];
  
          setActivityByDay(chartData);
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
        <BarChart data={activityByDay}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="logins" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      
      {motivationMessage && (
        <div className="motivation-message" style={{ color: "#2196F3", marginTop: "20px", padding: "30px", backgroundColor: "rgb(18 42 61)", borderRadius: "5px" }}>
          <p>{motivationMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;