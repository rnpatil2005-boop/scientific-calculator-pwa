function calculate(operation) {
    const resultEl = document.getElementById("result");
    const num1El = document.getElementById("num1");
    const num2El = document.getElementById("num2");
    const historyEl = document.getElementById("history");

    let a = parseFloat(num1El.value);
    let b = parseFloat(num2El.value);

    if (isNaN(a)) {
        resultEl.innerText = "Enter a valid number";
        return;
    }

    let result;
    let expr;

    try {
        switch (operation) {
            case "add":
                if (isNaN(b)) throw "Second number required";
                result = a + b;
                expr = `${a} + ${b}`;
                break;

            case "sub":
                if (isNaN(b)) throw "Second number required";
                result = a - b;
                expr = `${a} - ${b}`;
                break;

            case "mul":
                if (isNaN(b)) throw "Second number required";
                result = a * b;
                expr = `${a} × ${b}`;
                break;

            case "div":
                if (isNaN(b)) throw "Second number required";
                if (b === 0) throw "Cannot divide by zero";
                result = a / b;
                expr = `${a} ÷ ${b}`;
                break;

            case "sin":
                result = Math.sin(a * Math.PI / 180);
                expr = `sin(${a})`;
                break;

            case "cos":
                result = Math.cos(a * Math.PI / 180);
                expr = `cos(${a})`;
                break;

            case "log":
                if (a <= 0) throw "Invalid input for log";
                result = Math.log10(a);
                expr = `log(${a})`;
                break;

            case "sqrt":
                if (a < 0) throw "Invalid input for √";
                result = Math.sqrt(a);
                expr = `√(${a})`;
                break;

            case "pow":
                if (isNaN(b)) throw "Second number required";
                result = Math.pow(a, b);
                expr = `${a}^${b}`;
                break;

            default:
                throw "Unknown operation";
        }
    } catch (err) {
        resultEl.innerText = err;
        return;
    }

    result = Number(result.toFixed(5));
    resultEl.innerText = `Result: ${result}`;

    // 🟢 ONLINE → sync with backend
    if (navigator.onLine) {
        fetch("/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                num1: a,
                num2: isNaN(b) ? "" : b,
                operation: operation
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.history) {
                historyEl.innerHTML = "";
                data.history.forEach(item => {
                    let li = document.createElement("li");
                    li.innerText = item;
                    historyEl.appendChild(li);
                });
            }
        })
        .catch(() => {});
    }
    // 🔴 OFFLINE → local-only history
    else {
        let li = document.createElement("li");
        li.innerText = `${expr} = ${result}`;
        historyEl.prepend(li);
    }
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/static/sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("SW registration failed", err));
  });
}
