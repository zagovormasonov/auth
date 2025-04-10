import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import coneImg from "../assets/cone.png";
import menuImg from "../assets/menu.png";
import plusImg from "../assets/plus.svg";

// Компонент уведомления
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

// Компонент подтверждения удаления
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

// Модалка задания
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
  const [uploading, setUploading] = useState(false);
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
      fetchAvatar();
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

  const fetchAvatar = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (data?.avatar_url) setAvatarUrl(data.avatar_url);
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      showNotification("Аватар обновлён!");
    } catch (error) {
      console.error(error);
      showNotification("Ошибка при загрузке аватара", "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      const fileName = avatarUrl?.split("/").pop();
      if (!fileName) return;

      await supabase.storage.from("avatars").remove([fileName]);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      showNotification("Аватар удалён!");
    } catch (error) {
      console.error(error);
      showNotification("Ошибка при удалении аватара", "error");
    }
  };

  const showNotification = (message, type = "success") => {
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

  return (
    <div className="layout">
      <div className="header">
        <span className="profile_name">{user?.email}</span>
        <button onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}>Выйти</button>
      </div>

      <div className="avatar-section">
        {avatarUrl ? (
          <div className="avatar-container">
            <img src={avatarUrl} alt="Аватар" className="avatar-img" />
            <button onClick={deleteAvatar}>Удалить аватар</button>
          </div>
        ) : (
          <div>
            <label className="upload-label">
              Загрузить аватар
              <input type="file" accept="image/*" onChange={uploadAvatar} hidden />
            </label>
          </div>
        )}
        {uploading && <p>Загрузка...</p>}
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
