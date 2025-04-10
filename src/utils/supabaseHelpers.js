// utils/supabaseHelpers.js

import { supabase } from '../supabaseClient';

// Получить пользователя
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Вставка события входа в таблицу logins
export const saveLogin = async (userId) => {
  const { error } = await supabase.from('logins').insert([{ user_id: userId }]);
  if (error) throw error;
};

// Получение логинов по дням
export const fetchLoginsByDay = async (userId) => {
  const { data, error } = await supabase
    .from('logins')
    .select('sign_in_at')
    .eq('user_id', userId)
    .order('sign_in_at', { ascending: true });

  if (error) throw error;

  const groupedByDay = data.reduce((acc, item) => {
    const signInDate = new Date(item.sign_in_at);
    const dayOfWeek = signInDate.getUTCDay();
    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
    return acc;
  }, {});

  return [
    { day: 'Воскресенье', logins: groupedByDay[0] || 0 },
    { day: 'Понедельник', logins: groupedByDay[1] || 0 },
    { day: 'Вторник', logins: groupedByDay[2] || 0 },
    { day: 'Среда', logins: groupedByDay[3] || 0 },
    { day: 'Четверг', logins: groupedByDay[4] || 0 },
    { day: 'Пятница', logins: groupedByDay[5] || 0 },
    { day: 'Суббота', logins: groupedByDay[6] || 0 },
  ];
};

// Получить задания пользователя
export const fetchTasksForUser = async (userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Добавить новое задание
export const addTask = async ({ userId, title, description }) => {
  const { error } = await supabase
    .from('tasks')
    .insert([{ user_id: userId, title, description }]);

  if (error) throw error;
};

// Обновить задание
export const updateTask = async (taskId, { title, description }) => {
  const { error } = await supabase
    .from('tasks')
    .update({ title, description })
    .eq('id', taskId);

  if (error) throw error;
};

// Удалить задание
export const deleteTask = async (taskId) => {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
};

// Выйти из аккаунта
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
