const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const value = input.value.trim();
    if (value === "") return;

    const li = document.createElement("li");

    // checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // tekst zadania
    const span = document.createElement("span");
    span.textContent = value;

    // zaznaczanie jako wykonane
    checkbox.addEventListener("change", function() {
        span.classList.toggle("completed");
    });

    li.appendChild(checkbox);
    li.appendChild(span);

    taskList.appendChild(li);
    input.value = "";
});