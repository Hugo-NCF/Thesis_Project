import secrets
from datetime import datetime, timedelta

from flask import Flask, request, jsonify
from flask_cors import CORS

from users import (
    create_user,
    login_user,
    find_user,
    reset_password,
    add_favorite,
    remove_favorite,
    add_to_watchlist,
    remove_from_watchlist,
    mark_as_watched,
    remove_from_watched,
    get_favorites,
    get_watchlist,
    get_watched,
    get_all_users
)


app = Flask(__name__)

# allow the React frontend to talk to Flask
CORS(app)


# temporary development reset codes
# these disappear when Flask restarts
password_reset_codes = {}


# ----------------------------------------------------------
# ACCOUNT ROUTES
# ----------------------------------------------------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username:
        return jsonify({
            "error": "Username is required"
        }), 400

    if not email:
        return jsonify({
            "error": "Email is required"
        }), 400

    if not password:
        return jsonify({
            "error": "Password is required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters"
        }), 400

    result = create_user(
        username=username,
        email=email,
        password=password
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify(result), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier:
        return jsonify({
            "error": "Username or email is required"
        }), 400

    if not password:
        return jsonify({
            "error": "Password is required"
        }), 400

    result = login_user(
        identifier=identifier,
        password=password
    )

    if "error" in result:
        return jsonify(result), 401

    return jsonify(result), 200


# ----------------------------------------------------------
# PASSWORD RESET
# ----------------------------------------------------------

@app.route(
    "/api/password-reset/request",
    methods=["POST"]
)
def request_password_reset():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    identifier = data.get("identifier")

    if not identifier:
        return jsonify({
            "error": "Username or email is required"
        }), 400

    user = find_user(identifier)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    # create a six digit reset code
    reset_code = str(
        secrets.randbelow(900000) + 100000
    )

    expires_at = (
        datetime.now() +
        timedelta(minutes=10)
    )

    # save by username so email and username requests
    # still point to the same account
    password_reset_codes[user["username"]] = {
        "code": reset_code,
        "expires_at": expires_at
    }

    # DEVELOPMENT ONLY:
    # later this should be sent by email instead
    print()
    print("--------------------------------")
    print("ANIMATCH PASSWORD RESET")
    print(
        f"User: {user['username']}"
    )
    print(
        f"Reset code: {reset_code}"
    )
    print(
        "Code expires in 10 minutes."
    )
    print("--------------------------------")
    print()

    return jsonify({
        "message":
            "Reset code created. "
            "Check the Flask terminal."
    }), 200


@app.route(
    "/api/password-reset/confirm",
    methods=["POST"]
)
def confirm_password_reset():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    identifier = data.get("identifier")
    reset_code = data.get("code")
    new_password = data.get("new_password")

    if not identifier:
        return jsonify({
            "error": "Username or email is required"
        }), 400

    if not reset_code:
        return jsonify({
            "error": "Reset code is required"
        }), 400

    if not new_password:
        return jsonify({
            "error": "New password is required"
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "error":
                "Password must be at least 6 characters"
        }), 400

    user = find_user(identifier)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    reset_data = password_reset_codes.get(
        user["username"]
    )

    if not reset_data:
        return jsonify({
            "error":
                "No active reset code. "
                "Request a new code."
        }), 400

    if datetime.now() > reset_data["expires_at"]:
        password_reset_codes.pop(
            user["username"],
            None
        )

        return jsonify({
            "error":
                "Reset code expired. "
                "Request a new code."
        }), 400

    if reset_code != reset_data["code"]:
        return jsonify({
            "error": "Incorrect reset code"
        }), 400

    result = reset_password(
        identifier,
        new_password
    )

    if "error" in result:
        return jsonify(result), 400

    # remove the code after successful reset
    password_reset_codes.pop(
        user["username"],
        None
    )

    return jsonify(result), 200


# ----------------------------------------------------------
# WEEK 8
# COLLABORATIVE FILTERING
# ----------------------------------------------------------

@app.route(
    "/api/users",
    methods=["GET"]
)
def all_users():
    users = get_all_users()

    return jsonify({
        "users": users
    }), 200


# ----------------------------------------------------------
# WEEK 7
# USER PREFERENCES
# ----------------------------------------------------------

@app.route(
    "/api/users/<identifier>/favorites",
    methods=["POST", "DELETE"]
)
def user_favorites(identifier):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    anime_id = data.get("anime_id")

    if anime_id is None:
        return jsonify({"error": "Anime id is required"}), 400

    if request.method == "POST":
        result = add_favorite(identifier, anime_id)
    else:
        result = remove_favorite(identifier, anime_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result), 200


@app.route(
    "/api/users/<identifier>/watchlist",
    methods=["POST", "DELETE"]
)
def user_watchlist(identifier):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    anime_id = data.get("anime_id")

    if anime_id is None:
        return jsonify({"error": "Anime id is required"}), 400

    if request.method == "POST":
        result = add_to_watchlist(identifier, anime_id)
    else:
        result = remove_from_watchlist(identifier, anime_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result), 200


@app.route(
    "/api/users/<identifier>/watched",
    methods=["POST", "DELETE"]
)
def user_watched(identifier):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    anime_id = data.get("anime_id")

    if anime_id is None:
        return jsonify({"error": "Anime id is required"}), 400

    if request.method == "POST":
        result = mark_as_watched(identifier, anime_id)
    else:
        result = remove_from_watched(identifier, anime_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result), 200


@app.route(
    "/api/users/<identifier>/preferences",
    methods=["GET"]
)
def user_preferences(identifier):
    favorites = get_favorites(identifier)
    watchlist = get_watchlist(identifier)
    watched = get_watched(identifier)

    if isinstance(favorites, dict):
        if "error" in favorites:
            return jsonify(favorites), 404

    if isinstance(watchlist, dict):
        if "error" in watchlist:
            return jsonify(watchlist), 404

    if isinstance(watched, dict):
        if "error" in watched:
            return jsonify(watched), 404

    return jsonify({
        "favorites": favorites,
        "watchlist": watchlist,
        "watched": watched
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
