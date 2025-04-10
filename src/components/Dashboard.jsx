import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import coneImg from '../assets/cone.png';
import menuImg from '../assets/menu.png';
import plusImg from '../assets/plus.svg';

const TaskModal = ({ show, editingTask, title, description, setTitle, setDescription, onConfirm, onCancel }) => (
  <AnimatePresence>
    {show && (
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
          <h3>{editingTask ? "Редактировать задание" : "Новое задание"}</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
          <div className="modal-buttons">
            <button onClick={onConfirm}>Сохранить</button>
            <button onClick={onCancel}>Отмена</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const TaskItem = ({ task, onEdit, onDelete, openMenuTaskId, setOpenMenuTaskId }) => (
  <div className="task-item">
    <strong>{task.title}</strong>
    <img 
      src={menuImg} 
      alt="Меню" 
      className="menu-icon"
      onClick={() => setOpenMenuTaskId(openMenuTaskId === task.id ? null : task.id)} 
    />
    {openMenuTaskId === task.id && (
      <div className="task-menu">
        <button onClick={() => onEdit(task)}>✏️ Редактировать</button>
        <button onClick={() => onDelete(task.id)}>🗑️ Удалить</button>
      </div>
    )}
    <p>{task.description}</p>
    <small>Добавлено: {new Date(task.created_at).toLocaleString()}</small>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);
  const navigate = useNavigate();

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
      supabase.from("logins").insert([{ user_id: user.id }]);
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTasks(data || []);
  };

  const handleSaveTask = async () => {
    if (!title.trim() || !description.trim()) return alert("Заполни оба поля!");
    
    const taskData = { title, description, user_id: user.id };
    const { error } = editingTask
      ? await supabase.from("tasks").update(taskData).eq("id", editingTask.id)
      : await supabase.from("tasks").insert([taskData]);

    if (error) alert("Ошибка при сохранении");
    else {
      fetchTasks();
      setShowModal(false);
      setTitle("");
      setDescription("");
      setEditingTask(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Удалить задание?")) return;
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setShowModal(true);
  };

  return (
    <div className="layout">
      <div className="header">
        <span className="profile_name">{user?.email}</span>
        <button onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}>Выйти</button>
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <img src={coneImg} alt="Cone" />
          <p>У вас пока что нет заданий</p>
        </div>
      )}

      <p>Последний вход: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Нет данных"}</p>

      <button className="addButton" onClick={() => setShowModal(true)}>
        <img src={plusImg} alt="plus" />
      </button>

      <TaskModal
        show={showModal}
        editingTask={editingTask}
        title={title}
        description={description}
        setTitle={setTitle}
        setDescription={setDescription}
        onConfirm={handleSaveTask}
        onCancel={() => setShowModal(false)}
      />

      {tasks.length > 0 && (
        <div className="task-list">
          <h3>Твои задания:</h3>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              openMenuTaskId={openMenuTaskId}
              setOpenMenuTaskId={setOpenMenuTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;