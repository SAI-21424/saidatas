from flask import Flask, render_template, request, jsonify
from collections import defaultdict
import heapq

app = Flask(__name__)

# Hash Map
frequency = defaultdict(int)


# -----------------------------
# HOME PAGE
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# GET TOP-K USING MIN HEAP
# -----------------------------
def get_top_k(k):

    heap = []

    for item, freq in frequency.items():

        heapq.heappush(heap, (freq, item))

        if len(heap) > k:
            heapq.heappop(heap)

    result = sorted(
        heap,
        key=lambda x: (-x[0], x[1])
    )

    return [
        {
            "item": item,
            "frequency": freq
        }
        for freq, item in result
    ]


# -----------------------------
# ADD ELEMENT
# -----------------------------
@app.route("/add", methods=["POST"])
def add_element():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data received"
        }), 400

    item = str(data.get("item", "")).strip()

    try:
        k = int(data.get("k", 3))
    except:
        return jsonify({
            "error": "Invalid K value"
        }), 400

    if not item:
        return jsonify({
            "error": "Enter an element"
        }), 400

    if k <= 0:
        return jsonify({
            "error": "K must be greater than 0"
        }), 400

    # Update frequency
    frequency[item] += 1

    # Get Top-K
    top_k = get_top_k(k)

    # Get all elements
    all_data = [
        {
            "item": item_name,
            "frequency": freq
        }
        for item_name, freq in frequency.items()
    ]

    all_data.sort(
        key=lambda x: (-x["frequency"], x["item"])
    )

    return jsonify({
        "top_k": top_k,
        "all_data": all_data
    })


# -----------------------------
# RESET
# -----------------------------
@app.route("/reset", methods=["POST"])
def reset_tracker():

    frequency.clear()

    return jsonify({
        "message": "Tracker reset successfully"
    })


# -----------------------------
# RUN FLASK
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)