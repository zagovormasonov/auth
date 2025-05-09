import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import coneImg from '../assets/cone.png';
import menuImg from '../assets/menu.png';
import plusImg from '../assets/plus.svg';
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [activityByDay, setActivityByDay] = useState([]);
  const [motivationMessage, setMotivationMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modalStep, setModalStep] = useState(1);

  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);

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

    handleCancel();
    fetchTasks();
  };

  const handleCancel = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setEditingTask(null);
    setModalStep(1);
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
    setModalStep(1);
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

      {motivationMessage && (
        <div className="motivation-message" style={{ color: "#2196F3", marginTop: "20px", padding: "30px", backgroundColor: "rgb(18 42 61)", borderRadius: "5px" }}>
          <p style={{ color: "#2196F3" }}>{motivationMessage}</p>
        </div>
      )}

      <button className="addButton" onClick={() => setShowModal(true)}>
        <img src={plusImg} alt="plusImg" />
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: "black",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
              }}
            >
              <h3>{editingTask ? "Редактировать задание" : "Новое задание"}</h3>

              {modalStep === 1 && (
                <input
                  type="text"
                  placeholder="Название"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
                />
              )}

              {modalStep === 2 && (
                <textarea
                  placeholder="Описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
                />
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {modalStep > 1 ? (
                  <button onClick={() => setModalStep((s) => s - 1)}>Назад</button>
                ) : (
                  <div />
                )}

                {modalStep < 2 ? (
                  <button
                    onClick={() => {
                      if (!title.trim()) {
                        alert("Введите название!");
                      } else {
                        setModalStep((s) => s + 1);
                      }
                    }}
                  >
                    Далее
                  </button>
                ) : (
                  <button onClick={handleConfirm}>Сохранить</button>
                )}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button onClick={handleCancel} style={{ width: "100%", marginTop: "10px" }}>
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks.length > 0 && (
        <div className="task-list" style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "10px" }}>Твои задания:</h3>
          {tasks.map((task) => (
            <div key={task.id} style={{ backgroundColor: "white", padding: "10px", marginBottom: "10px", borderRadius: "5px", position: "relative" }}>
              <strong style={{ color: "black" }}>{task.title}</strong>

              <img
                src={menuImg}
                alt="Меню"
                style={{ cursor: "pointer", float: "right" }}
                onClick={() => setOpenMenuTaskId(openMenuTaskId === task.id ? null : task.id)}
              />

              {openMenuTaskId === task.id && (
                <div style={{
                  position: "absolute",
                  top: "30px",
                  right: "10px",
                  backgroundColor: "#222",
                  padding: "10px",
                  borderRadius: "5px",
                  zIndex: 1,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                }}>
                  <button onClick={() => handleEdit(task)} style={{ display: "block", marginBottom: "5px", width: "100%" }}>
                    ✏️ Редактировать
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ display: "block", width: "100%" }}>
                    🗑️ Удалить
                  </button>
                </div>
              )}

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
