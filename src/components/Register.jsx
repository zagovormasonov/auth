import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Проверьте почту для подтверждения!");
      navigate("/login"); // После регистрации переходим на страницу входа
    }
  };

  return (
    <div className="wrapper">
      <h1>Viremo</h1>
      <h2 className="text-4xl font-light flex-1/4 text-blue-500 mb-1">Регистрация</h2>
      <form onSubmit={handleRegister}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>
        Есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default Register;
