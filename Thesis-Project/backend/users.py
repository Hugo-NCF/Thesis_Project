import bcrypt
from database import get_users_collection

def create_user(username, email, password):
    # get user collection
    users_collection = get_users_collection()

    # check if username already exists
    if users_collection.find_one({"username": username}):
        return {"error": "Username already exists"}

    # check if email already exists
    if users_collection.find_one({"email": email}):
        return {"error": "Email already exists"}

    # convert password to bytes
    password_bytes = password.encode('utf-8')

    # hash the password
    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    # convert hashed password to string
    hashed_password_str = hashed_password.decode('utf-8')

    # build user dictionary
    user = {
        "username": username,
        "email": email,
        "password_hash": hashed_password_str,
        "favorites": [],
        "watchlist": [],
        "watched": []
    }

    # insert user into MongoDB
    result = users_collection.insert_one(user)

    # return success message and new user id
    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }

def find_user(identifier):
    # get user collection
    users_collection = get_users_collection()

    # find user by username or email
    user = users_collection.find_one(
        {"$or": [{"username": identifier}, {"email": identifier}]}
    )

    # Returns matching user 
    return user

def verify_password(password, password_hash):
    # convert password to bytes
    password_bytes = password.encode('utf-8')
    # convert password hash to bytes
    password_hash_bytes = password_hash.encode('utf-8')

    # check if password matches the hash
    return bcrypt.checkpw(password_bytes, password_hash_bytes)

def login_user(identifier, password):
    # find user by username or email
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}

    # get stored password hash
    stored_password_hash = user["password_hash"]

    # verify password
    if not verify_password(password, stored_password_hash):
        # if wrong password, return error
        return {"error": "Incorrect password"}

    # if correct, return success + basic user info
    return {
        "message": "Login successful",
        "user": {
            "username": user["username"],
            "email": user["email"]
        }
    }

def add_favorite(identifier, anime_id):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # updates the user's favorites list using $addToSet
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"favorites": anime_id}}
    )

    # returns success message
    if result.modified_count > 0:
        return {"message": "Anime added to favorites"}
    else:
        return {"message": "Anime was already in favorites"}
    
def remove_favorite(identifier, anime_id):
    # finds user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # remove anime from user's favorites list using $pull
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"favorites": anime_id}}
    )

    # returns whether any anime was removed from favorites
    if result.modified_count > 0:
        return {"message": "Anime removed from favorites"}
    else:
        return {"message": "Anime was not in favorites"}

def add_to_watchlist(identifier, anime_id):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # updates the user's watchlist using $addToSet
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"watchlist": anime_id}}
    )

    # returns success message
    if result.modified_count > 0:
        return {"message": "Anime added to watchlist"}
    else:
        return {"message": "Anime was already in watchlist"}
    
def remove_from_watchlist(identifier, anime_id):
    # finds user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # remove anime from user's watchlist using $pull
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"watchlist": anime_id}}
    )

    # returns whether any anime was removed from watchlist
    if result.modified_count > 0:
        return {"message": "Anime removed from watchlist"}
    else:
        return {"message": "Anime was not in watchlist"}
    
def mark_as_watched(identifier, anime_id):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # updates the user's watched list using $addToSet
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"watched": anime_id}}
    )

    # returns success message
    if result.modified_count > 0:
        return {"message": "Anime marked as watched"}
    else:
        return {"message": "Anime was already marked as watched"}
    
def remove_from_watched(identifier, anime_id):
    # finds user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # gets user collection
    users_collection = get_users_collection()

    # remove anime from user's watched list using $pull
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"watched": anime_id}}
    )

    # returns whether any anime was removed from watched list
    if result.modified_count > 0:
        return {"message": "Anime removed from watched list"}
    else:
        return {"message": "Anime was not in watched list"}

# helper functions
def get_favorites(identifier):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # returns users favorites list
    return {"favorites": user.get("favorites", [])}

def get_watchlist(identifier):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # returns users watchlist
    return {"watchlist": user.get("watchlist", [])}

def get_watched(identifier):
    # finds the user
    user = find_user(identifier)

    # if user not found, return error
    if not user:
        return {"error": "User not found"}
    
    # returns users watched list
    return {"watched": user.get("watched", [])}



# testing for user creation 
