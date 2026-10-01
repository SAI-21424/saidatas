from flask import Flask, render_template, request, jsonify
from collections import defaultdict
import heapq

app = Flask(__name__)

frequency = defaultdict(int)


def get_top_k(k):
    heap = []

    for item, freq in frequency.items():
        heapq.heappush(heap, (freq, item))

        if len(heap) > k:
            heapq.heappop(heap)

    result = sorted(heap, key=lambda x: (-x[0], x[1]))

    return [
        {"item": item, "frequency": freq}
        for freq, item in result
    ]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/add", methods=["POST"])
def add_element():
    data = request.get_json()

    item = str(data["item"]).strip()
    k = int(data["k"])

    if not item:
        return jsonify({"error": "Enter an element"}), 400

    if k <= 0:
        return jsonify({"error": "K must be greater than 0"}), 400

    frequency[item] += 1

    top_k = get_top_k(k)

    all_data = [
        {"item": item, "frequency": freq}
        for item, freq in frequency.items()
    ]

    all_data.sort(key=lambda x: (-x["frequency"], x["item"]))

    return jsonify({
        "top_k": top_k,
        "all_data": all_data
    })


@app.route("/reset", methods=["POST"])
def reset():
    frequency.clear()
    return jsonify({"message": "Tracker reset successfully"})


if __name__ == "__main__":
    app.run(debug=True)
