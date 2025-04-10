// Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import ActivityAnalyzer from "./ActivityAnalyzer";
import { fetchLogins, saveLogin, fetchTasks as getTasks } from "../utils/supabaseHelpers";
import TaskCard from "../components/TaskCard";
import Modal from "../components/Modal";
import coneImg from '../assets/cone.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activityByDay, setActivityByDay] = useState([]);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);

  const navigate = useNavigate();

  <ActivityAnalyzer activityByDay={activityByDay} />


  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) navigate("/login");
      else setUser(data.user);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      saveLogin(user);
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    const tasks = await getTasks(user);
    setTasks(tasks);

    const logins = await fetchLogins(user);
    setActivityByDay(logins);
  };

  const handleConfirm = async () => {
    if (!title.trim() || !description.trim()) return alert("Заполни оба поля!");

    const task = { user_id: user.id, title, description };
    const error = editingTask
      ? await supabase.from("tasks").update(task).eq("id", editingTask.id)
      : await supabase.from("tasks").insert([task]);

    if (error) alert("Ошибка при сохранении");
    else {
      fetchUserData();
      setShowModal(false);
      setTitle("");
      setDescription("");
      setEditingTask(null);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Удалить задание?")) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchUserData();
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

      {motivationMessage && (
        <div className="motivation-message" style={{ color: "#2196F3", marginTop: "20px", padding: "30px", backgroundColor: "rgb(18 42 61)", borderRadius: "5px" }}>
          <p>{motivationMessage}</p>
        </div>
      )}

      <button className="addButton" onClick={() => setShowModal(true)}></button>

      {tasks.length === 0 && (
        <div>
          <img src={coneImg} alt="Cone" style={{ width: "150px", marginTop: "20px" }} />
          <p>У вас пока что нет заданий</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="task-list" style={{ marginTop: "30px" }}>
          <h3>Твои задания:</h3>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        title={editingTask ? "Редактировать задание" : "Новое задание"}
        taskTitle={title}
        taskDescription={description}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onClose={() => setShowModal(false)}
        onSave={handleConfirm}
      />
    </div>
  );
};

export default Dashboard;