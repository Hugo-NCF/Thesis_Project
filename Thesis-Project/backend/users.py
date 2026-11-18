import bcrypt

from database import get_users_collection


# ----------------------------------------------------------
# ACCOUNT FUNCTIONS
# ----------------------------------------------------------

def create_user(username, email, password):
    users_collection = get_users_collection()

    # check if username already exists
    if users_collection.find_one({"username": username}):
        return {
            "error": "Username already exists"
        }

    # check if email already exists
    if users_collection.find_one({"email": email}):
        return {
            "error": "Email already exists"
        }

    # hash the password before saving it
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # create the user document
    user = {
        "username": username,
        "email": email,
        "password_hash": password_hash.decode("utf-8"),
        "favorites": [],
        "watchlist": [],
        "watched": []
    }

    result = users_collection.insert_one(user)

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }


def find_user(identifier):
    users_collection = get_users_collection()

    return users_collection.find_one({
        "$or": [
            {"username": identifier},
            {"email": identifier}
        ]
    })


def verify_password(password, password_hash):
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


def login_user(identifier, password):
    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    if not verify_password(
        password,
        user["password_hash"]
    ):
        return {
            "error": "Incorrect password"
        }

    return {
        "message": "Login successful",
        "user": {
            "username": user["username"],
            "email": user["email"]
        }
    }


def reset_password(identifier, new_password):
    """
    Reset a user's password after the reset code
    has already been verified by the API.
    """

    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    password_hash = bcrypt.hashpw(
        new_password.encode("utf-8"),
        bcrypt.gensalt()
    )

    users_collection.update_one(
        {
            "_id": user["_id"]
        },
        {
            "$set": {
                "password_hash":
                    password_hash.decode("utf-8")
            }
        }
    )

    return {
        "message": "Password reset successfully"
    }


# ----------------------------------------------------------
# FAVORITES
# ----------------------------------------------------------

def add_favorite(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    if anime_id in user.get("favorites", []):
        return {
            "message": "Anime already in favorites"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$addToSet": {
                "favorites": anime_id
            }
        }
    )

    return {
        "message": "Anime added to favorites"
    }


def remove_favorite(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$pull": {
                "favorites": anime_id
            }
        }
    )

    return {
        "message": "Anime removed from favorites"
    }


def get_favorites(identifier):
    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    return user.get("favorites", [])


# ----------------------------------------------------------
# WATCHLIST
# ----------------------------------------------------------

def add_to_watchlist(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    if anime_id in user.get("watchlist", []):
        return {
            "message": "Anime already in watchlist"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$addToSet": {
                "watchlist": anime_id
            }
        }
    )

    return {
        "message": "Anime added to watchlist"
    }


def remove_from_watchlist(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$pull": {
                "watchlist": anime_id
            }
        }
    )

    return {
        "message": "Anime removed from watchlist"
    }


def get_watchlist(identifier):
    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    return user.get("watchlist", [])


# ----------------------------------------------------------
# WATCHED
# ----------------------------------------------------------

def mark_as_watched(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    if anime_id in user.get("watched", []):
        return {
            "message": "Anime already marked as watched"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$addToSet": {
                "watched": anime_id
            }
        }
    )

    return {
        "message": "Anime marked as watched"
    }


def remove_from_watched(identifier, anime_id):
    users_collection = get_users_collection()

    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$pull": {
                "watched": anime_id
            }
        }
    )

    return {
        "message": "Anime removed from watched"
    }


def get_watched(identifier):
    user = find_user(identifier)

    if not user:
        return {
            "error": "User not found"
        }

    return user.get("watched", [])



# ----------------------------------------------------------
# WEEK 8
# COLLABORATIVE FILTERING
# ----------------------------------------------------------

def get_all_users():
    users_collection = get_users_collection()

    users = []

    for user in users_collection.find():
        users.append({
            "username": user.get("username"),
            "favorites": user.get(
                "favorites",
                []
            ),
            "watchlist": user.get(
                "watchlist",
                []
            ),
            "watched": user.get(
                "watched",
                []
            )
        })

    return users
