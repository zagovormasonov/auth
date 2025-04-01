import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const TaskCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]); // Массив задач для выбранной даты

  // Обработчик изменения даты
  const handleDateChange = (newDate) => {
    setDate(newDate);
    // Здесь можно загружать задачи для этой даты из базы данных или локального хранилища
  };

  // Функция для добавления новой задачи
  const addTask = () => {
    const taskName = prompt("Введите название задачи");
    if (taskName) {
      setTasks([...tasks, { date, taskName }]);
    }
  };

  return (
    <div className="task-calendar">
      <Calendar onChange={handleDateChange} value={date} />
      <button onClick={addTask}>Добавить задачу</button>

      <div className="task-list">
        <h3>Задачи на {date.toLocaleDateString()}</h3>
        <ul>
          {tasks
            .filter((task) => task.date.toDateString() === date.toDateString())
            .map((task, index) => (
              <li key={index}>{task.taskName}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskCalendar;