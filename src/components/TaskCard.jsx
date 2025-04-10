import menuImg from '../assets/menu.png';

const TaskCard = ({ task, onEdit, onDelete, onMenuClick, showMenu }) => {
  return (
    <div style={{ backgroundColor: 'white', padding: '10px', marginBottom: '10px', borderRadius: '5px', position: 'relative' }}>
      <strong style={{ color: 'black' }}>{task.title}</strong>
      <img
        src={menuImg}
        alt="menu"
        onClick={() => onMenuClick(task.id)}
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
      />
      <p>{task.description}</p>
      <small style={{ color: '#777' }}>Добавлено: {new Date(task.created_at).toLocaleString()}</small>
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '5px',
            zIndex: 1000,
          }}
        >
          <button onClick={() => onEdit(task)} style={{ display: 'block', width: '100%' }}>Редактировать</button>
          <button onClick={() => onDelete(task.id)} style={{ display: 'block', width: '100%' }}>Удалить</button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
