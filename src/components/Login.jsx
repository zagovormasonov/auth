import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("savedEmail") || "");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/dashboard"); // Если уже авторизован, сразу на Dashboard
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (email) {
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 3000);
    }
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      localStorage.setItem("savedEmail", email); // Сохраняем email
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }
  };

  return (
    <div className="wrapper">
      <h1>Viremo</h1>
      <h2 className="text-4xl font-light text-blue-500 mb-1">Вход</h2>
      <form className="p-3 flex-1/4" onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          {tooltipVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                top: "-30px",
                left: "0",
                background: "#000",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "12px",
              }}
            >
              Используйте ранее введенный email
            </motion.div>
          )}
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
        />
        <button type="submit">Войти</button>
      </form>

      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#25F475",
            color: "black",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          Успешный вход!
        </motion.div>
      )}
    </div>
  );
};

export default Login;
