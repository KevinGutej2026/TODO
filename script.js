const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const value = input.value.trim();
    if (value === "") return;

    const li = document.createElement("li");
    li.textContent = value;

    li.addEventListener("click", function() {
        li.classList.toggle("completed");
    });

    taskList.appendChild(li);
    input.value = "";
});