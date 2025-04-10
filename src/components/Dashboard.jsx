import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import coneImg from '../assets/cone.png';
import menuImg from '../assets/menu.png';
import plusImg from '../assets/plus.svg';

const Notification = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`notification ${type}`}
  >
    {message}
    <button onClick={onClose} className="close-btn">×</button>
  </motion.div>
);

const ConfirmDeleteModal = ({ show, onConfirm, onCancel }) => (
  <AnimatePresence>
    {show && (
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
          <h3>Удалить задание?</h3>
          <p>Вы уверены, что хотите удалить это задание?</p>
          <div className="modal-buttons">
            <button onClick={onConfirm} className="confirm-btn">Да</button>
            <button onClick={onCancel}>Нет</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
  const [notification, setNotification] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
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
      fetchProfile();
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

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    setAvatarUrl(data?.avatar_url || null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveTask = async () => {
    if (!title.trim() || !description.trim()) {
      showNotification("Заполни оба поля!", "error");
      return;
    }

    const taskData = { title, description, user_id: user.id };
    const { error } = editingTask
      ? await supabase.from("tasks").update(taskData).eq("id", editingTask.id)
      : await supabase.from("tasks").insert([taskData]);

    if (error) {
      showNotification("Ошибка при сохранении", "error");
    } else {
      showNotification(editingTask ? "Задание обновлено!" : "Задание добавлено!");
      fetchTasks();
      setShowModal(false);
      setTitle("");
      setDescription("");
      setEditingTask(null);
    }
  };

  const handleDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskToDelete);
    if (error) {
      showNotification("Ошибка при удалении", "error");
    } else {
      showNotification("Задание удалено!");
      fetchTasks();
    }
    setShowConfirmDelete(false);
    setTaskToDelete(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setShowModal(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      showNotification("Ошибка при загрузке аватара", "error");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, avatar_url: publicUrl });

    if (updateError) {
      showNotification("Ошибка при сохранении URL", "error");
      return;
    }

    showNotification("Аватар обновлён!");
    setAvatarUrl(publicUrl);
  };

  const handleAvatarDelete = async () => {
    const fileName = avatarUrl?.split("/").pop();
    const folder = avatarUrl?.split("/").slice(-2, -1)[0];
    const filePath = `${folder}/${fileName}`;

    await supabase.storage.from("avatars").remove([filePath]);

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);

    setAvatarUrl(null);
    showNotification("Аватар удалён");
  };

  return (
    <div className="layout">
      <div className="header">
        <div className="avatar-section">
          {avatarUrl ? (
            <>
              <img src={avatarUrl} alt="avatar" className="avatar" />
              <button onClick={handleAvatarDelete}>Удалить аватар</button>
            </>
          ) : (
            <>
              <input type="file" onChange={handleAvatarUpload} />
            </>
          )}
        </div>

        <span className="profile_name">{user?.email}</span>
        <button onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}>Выйти</button>
      </div>

      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

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

      <ConfirmDeleteModal
        show={showConfirmDelete}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
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
