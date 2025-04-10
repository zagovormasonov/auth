import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import coneImg from '../assets/cone.png';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [activityByDay, setActivityByDay] = useState([]);
  const [motivationMessage, setMotivationMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingTask, setEditingTask] = useState(null);
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

  // useEffect(() => {
  //   const fetchLogins = async () => {
  //     if (user) {
  //       const { data } = await supabase
  //         .from("logins")
  //         .select("sign_in_at")
  //         .eq("user_id", user.id)
  //         .order("sign_in_at", { ascending: true });

  //       if (data) {
  //         const groupedByDay = data.reduce((acc, item) => {
  //           const signInDate = new Date(item.sign_in_at);
  //           const dayOfWeek = signInDate.getUTCDay();
  //           acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
  //           return acc;
  //         }, {});

  //         const chartData = [
  //           { day: "Воскресенье", logins: groupedByDay[0] || 0 },
  //           { day: "Понедельник", logins: groupedByDay[1] || 0 },
  //           { day: "Вторник", logins: groupedByDay[2] || 0 },
  //           { day: "Среда", logins: groupedByDay[3] || 0 },
  //           { day: "Четверг", logins: groupedByDay[4] || 0 },
  //           { day: "Пятница", logins: groupedByDay[5] || 0 },
  //           { day: "Суббота", logins: groupedByDay[6] || 0 },
  //         ];

  //         setActivityByDay(chartData);
  //       }
  //     }
  //   };

  //   fetchLogins();
  // }, [user]);

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

  const fetchTasks = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
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

    if (editingTask) {
      // Обновление задачи
      const { error } = await supabase
        .from("tasks")
        .update({ title, description })
        .eq("id", editingTask.id);

      if (error) {
        alert("Ошибка при редактировании");
      } else {
        alert("Задание обновлено!");
      }
    } else {
      // Добавление новой задачи
      const { error } = await supabase.from("tasks").insert([
        {
          user_id: user.id,
          title,
          description,
        },
      ]);

      if (error) {
        alert("Ошибка при сохранении");
      } else {
        alert("Задание успешно добавлено!");
      }
    }

    setShowModal(false);
    setTitle("");
    setDescription("");
    setEditingTask(null);
    fetchTasks();
  };

  const handleCancel = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setEditingTask(null);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm("Удалить задание?");
    if (!confirmed) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      alert("Ошибка при удалении");
    } else {
      fetchTasks();
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="layout"> 
      <span className="profile_name">{user?.email}</span>
      <button onClick={handleLogout}>Выйти</button>
      {tasks.length === 0 && (
        <div>
          <img src={coneImg} alt="Cone" style={{ width: "150px", marginTop: "20px" }} />
          <p>У вас пока что нет заданий</p>
        </div>  
      )}
      <p>Последний вход: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Нет данных"}</p>

      {/* <ResponsiveContainer width="100%" height={300}>
        <BarChart data={activityByDay}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="logins" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer> */}

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
            <h3>{editingTask ? "Редактировать задание" : "Новое задание"}</h3>
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
              <button onClick={handleConfirm}>Сохранить</button>
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
            <div key={task.id} style={{ backgroundColor: "white", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
              <strong style={{ color: "black" }}>{task.title}</strong>
              <p>{task.description}</p>
              <small style={{ color: "#777" }}>
                Добавлено: {new Date(task.created_at).toLocaleString()}
              </small>
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleEdit(task)} style={{ marginRight: "10px" }}>Редактировать</button>
                <button onClick={() => handleDelete(task.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
