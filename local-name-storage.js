const nameFields = [
    document.getElementById("name"),
    document.getElementById("occName"),
];

function prefillName() {
    const saved = localStorage.getItem("customerName");
    if (saved) {
        nameFields.forEach(field => {
            if (field && !field.value) field.value = saved;
        });
    }
}

function updateName(newName) {
    if (!newName.trim()) return;
    localStorage.setItem("customerName", newName);

    nameFields.forEach(field => {
        if (field && field.value !== newName) field.value = newName;
    });
}

nameFields.forEach(field => {
    if (field) {
        field.addEventListener("input", () => {
            updateName(field.value);
        });
    }
});

document.addEventListener("DOMContentLoaded", prefillName);
