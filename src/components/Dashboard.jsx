import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [activityByDay, setActivityByDay] = useState([]);
  const [motivationMessage, setMotivationMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tasks, setTasks] = useState([]);

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
            const signInDate = new Date(item.sign_in_at);
            const dayOfWeek = signInDate.getUTCDay();
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
            return acc;
          }, {});

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
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login");
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, [navigate]);

  // Загрузка задач из Supabase
  const fetchTasks = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка при получении задач:", error.message);
      } else {
        setTasks(data);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleConfirm = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Заполни оба поля!");
      return;
    }

    const { error } = await supabase.from("tasks").insert([
      {
        user_id: user.id,
        title,
        description,
      },
    ]);

    if (error) {
      console.error("Ошибка при сохранении:", error.message);
      alert("Ошибка при сохранении");
    } else {
      alert("Задание успешно добавлено!");
      setShowModal(false);
      setTitle("");
      setDescription("");
      fetchTasks(); // Подгружаем задачи снова
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
  };

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
          <p style={{ color: "#2196F3" }}>{motivationMessage}</p>
        </div>
      )}

        <button className="addButton" onClick={() => setShowModal(true)}></button>

      {/* Модальное окно */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "black",
            padding: "20px",
            borderRadius: "8px",
            width: "300px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
          }}>
            <h3>Новое задание</h3>
            <input
              type="text"
              placeholder="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <textarea
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={handleConfirm}>Подтвердить</button>
              <button onClick={handleCancel}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Список задач */}
      {tasks.length > 0 && (
        <div className="task-list" style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "10px" }}>Твои задания:</h3>
          {tasks.map((task) => (
            <div key={task.id} style={{ backgroundColor: "black", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small style={{ color: "#777" }}>
                Добавлено: {new Date(task.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
