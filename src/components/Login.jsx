import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("savedEmail") || "");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // Состояние для тултипа
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("savedEmail", email); // Сохраняем email при изменении
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      localStorage.setItem("savedEmail", email); // Сохраняем email после успешного входа
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }
  };

  return (
    <div style={{ position: "relative", maxWidth: "300px", margin: "auto" }}>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <div style={{ position: "relative" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setShowTooltip(true)}  // Показать тултип при фокусе
            onBlur={() => setShowTooltip(false)}   // Скрыть тултип при уходе фокуса
            placeholder="Email"
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          {showTooltip && localStorage.getItem("savedEmail") && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                top: "-30px",
                left: "0",
                background: "black",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              Использовать: {localStorage.getItem("savedEmail")}
            </motion.div>
          )}
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "8px" }}>Войти</button>
      </form>

      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#25F475",
            color: "white",
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
