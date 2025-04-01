import { useState, useEffect } from "react";
import Recommend from "./Recommend";

export default function Layout() {
    
    const [data, setData] = useState({ title: "", description: "", probability: "" });

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/posts/2")
            .then((response) => response.json())
            .then((data) =>
                setData({
                    title: data.title,
                    description: data.body,
                    probability: `Вероятность: ${Math.floor(Math.random() * 100)}%`, // случайная вероятность
                })
            )
            .catch((error) => console.error("Ошибка загрузки данных:", error));
    }, []);

    return (
        <div className="container">
            <h1>{data.title || "Загрузка..."}</h1>
            <p>{data.description || "Ожидаем данные..."}</p>
            <h2>{data.probability || "Рассчитываем вероятность..."}</h2>
            <Recommend />
        </div>
    );
}
