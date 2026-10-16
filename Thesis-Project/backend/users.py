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
        "password_hash": hashed_password_str
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


    



# testing for user creation 
if __name__ == "__main__":
    print("TEST 1: Correct login")
    print(
        login_user(
            "testuser",
            "password123"
        )
    )

    print("\nTEST 2: Wrong password")
    print(
        login_user(
            "testuser",
            "wrongpassword"
        )
    )

    print("\nTEST 3: User does not exist")
    print(
        login_user(
            "notarealuser",
            "password123"
        )
    )