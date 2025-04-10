import { useEffect, useState } from 'react';

const ActivityAnalyzer = ({ activityByDay }) => {
  const [motivationMessage, setMotivationMessage] = useState('');

  useEffect(() => {
    const analyzeActivity = () => {
      const activeWeekdays = activityByDay.filter((day) => day.logins > 0);

      if (activeWeekdays.length === 0) {
        setMotivationMessage('Ты не заходил в систему несколько дней. Не забывай проверять обновления!');
      } else if (activeWeekdays.length === 7) {
        setMotivationMessage('Ты активен каждый день! Отличная регулярность!');
      } else if (activeWeekdays.every((day) => day.day === 'Воскресенье' || day.day === 'Суббота')) {
        setMotivationMessage('Ты зашел только в выходные. Попробуй быть активнее в будние дни!');
      } else {
        setMotivationMessage('Ты заходишь в систему регулярно. Молодец!');
      }
    };

    analyzeActivity();
  }, [activityByDay]);

  return (
    motivationMessage && (
      <div
        className="motivation-message"
        style={{
          color: '#2196F3',
          marginTop: '20px',
          padding: '30px',
          backgroundColor: 'rgb(18 42 61)',
          borderRadius: '5px',
        }}
      >
        <p>{motivationMessage}</p>
      </div>
    )
  );
};

export default ActivityAnalyzer;
