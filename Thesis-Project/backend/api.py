from flask import Flask, request, jsonify
from flask_cors import CORS

from users import create_user, login_user


app = Flask(__name__)

# allow React to communicate with the Python API
CORS(app)


@app.route("/api/register", methods=["POST"])
def register():
    # get JSON sent from React
    data = request.get_json()

    # check if JSON data was provided
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # get username, email, and password
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # check that username was provided
    if not username:
        return jsonify({"error": "Username is required"}), 400

    # check that email was provided
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # check that password was provided
    if not password:
        return jsonify({"error": "Password is required"}), 400

    # call create_user()
    result = create_user(
        username=username,
        email=email,
        password=password
    )

    # return an error status if account creation failed
    if "error" in result:
        return jsonify(result), 400

    # return the result as JSON
    return jsonify(result), 201

@app.route("/api/login", methods=["POST"])
def login():
    # get JSON sent from React
    data = request.get_json()

    # check if JSON data was provided
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # get identifier and password
    identifier = data.get("identifier")
    password = data.get("password")

    # check that identifier was provided
    if not identifier:
        return jsonify({"error": "Username or email is required"}), 400

    # check that password was provided
    if not password:
        return jsonify({"error": "Password is required"}), 400

    # call login_user()
    result = login_user(
        identifier=identifier,
        password=password
    )

    # return an error status if login failed
    if "error" in result:
        return jsonify(result), 401

    # return the result as JSON
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)