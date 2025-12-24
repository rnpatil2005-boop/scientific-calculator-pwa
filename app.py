from flask import Flask, render_template, request, jsonify
import math
import sqlite3

app = Flask(__name__)
DB = "calc.db"


# ---------- DATABASE SETUP ----------
def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expression TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()


# ---------- ROUTES ----------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json

    try:
        a = float(data["num1"])
        b_raw = data.get("num2", "")
        b = float(b_raw) if b_raw != "" else None
        op = data["operation"]

        if op == "add":
            result = a + b
            expr = f"{a} + {b}"

        elif op == "sub":
            result = a - b
            expr = f"{a} - {b}"

        elif op == "mul":
            result = a * b
            expr = f"{a} × {b}"

        elif op == "div":
            if b == 0:
                return jsonify({"result": "Cannot divide by zero"})
            result = a / b
            expr = f"{a} ÷ {b}"

        elif op == "sin":
            result = math.sin(math.radians(a))
            expr = f"sin({a})"

        elif op == "cos":
            result = math.cos(math.radians(a))
            expr = f"cos({a})"

        elif op == "log":
            result = math.log10(a)
            expr = f"log({a})"

        elif op == "sqrt":
            result = math.sqrt(a)
            expr = f"√({a})"

        elif op == "pow":
            result = a ** b
            expr = f"{a}^{b}"

        else:
            return jsonify({"result": "Invalid operation"})

        final = f"{expr} = {round(result, 5)}"

        conn = sqlite3.connect(DB)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO history (expression) VALUES (?)",
            (final,)
        )
        conn.commit()

        cur.execute(
            "SELECT expression FROM history ORDER BY id DESC LIMIT 10"
        )
        history = [row[0] for row in cur.fetchall()]
        conn.close()

        return jsonify({
            "result": round(result, 5),
            "history": history
        })

    except Exception:
        return jsonify({"result": "Invalid input"})


# ---------- START SERVER ----------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
