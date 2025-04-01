import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [chatResponse, setChatResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login"); // Если пользователь не авторизован, перенаправляем на login
      } else {
        setUser(data.user);
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };


  const fetchChatGPTResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = "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"; // Замените на свой ключ OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "gpt-4o-mini", // Модель ChatGPT
          prompt: "Расскажи что-нибудь интересное", // Пример запроса
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      setChatResponse(response.data.choices[0].text.trim()); // Устанавливаем текст ответа
    } catch (err) {
      setError("Не удалось получить ответ от ChatGPT.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatGPTResponse(); // Загружаем ответ при загрузке Dashboard
  }, []);



  return (
    <div className="layout">
      <span className="profile_name">{user?.email}</span>
      <button onClick={handleLogout}>Выйти</button>

      <button onClick={fetchChatGPTResponse} disabled={loading}>
        {loading ? "Загрузка..." : "Получить интересный факт от ChatGPT"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {chatResponse && (
        <div>
          <h2>Ответ от ChatGPT:</h2>
          <p>{chatResponse}</p>
        </div>
      )}


    </div>
  );
};

export default Dashboard;