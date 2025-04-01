import { useState, useEffect } from "react";

export default function Recommend() {

    

    class Person {

        constructor(name, age) {
            this.name = name
            this.age = age
        }

        eat() {
            console.log('Eat')
        }
        sleep() {
            console.log('sleep')
        }
    }

    class Developer extends Person {
        writeCode() {
            console.log(this.name, this.age, 'write code')
        }
    }

    const exampleDeveloper = new Developer('Mike', 27)

    exampleDeveloper.writeCode()
    




    const [recommendation, setRecommendation] = useState({ title: "", body: "" });

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/posts/1")
            .then((response) => response.json())
            .then((data) => setRecommendation({ title: data.title, body: data.body }))
            .catch((error) => console.error("Ошибка загрузки данных:", error));
    }, []);

    return (
        <div className="recommend">
            <p className="recomHeader">{recommendation.title || "Загрузка..."}</p>
            <p className="recomDescr">{recommendation.body || "Ожидаем данные..."}</p>
        </div>
    );
}
