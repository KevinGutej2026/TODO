const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

let tasks = [];

// wczytanie danych po odświeżeniu
window.addEventListener("load", function () {
    const saved = localStorage.getItem("tasks");

    if (saved) {
        tasks = JSON.parse(saved);
        tasks.forEach(task => renderTask(task));
    }
});

// zapis do localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// tworzenie elementu na stronie
function renderTask(task) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.done) {
        span.classList.add("completed");
    }

    // zmiana statusu checkboxa
    checkbox.addEventListener("change", function () {
        task.done = checkbox.checked;

        if (task.done) {
            span.classList.add("completed");
        } else {
            span.classList.remove("completed");
        }

        saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    taskList.appendChild(li);
}

// dodawanie nowego zadania
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const value = input.value.trim();
    if (value === "") return;

    const newTask = {
        text: value,
        done: false
    };

    tasks.push(newTask);
    renderTask(newTask);
    saveTasks();

    input.value = "";
});