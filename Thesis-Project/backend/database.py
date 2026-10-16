"""
MongoDB connection for the Anime Recommender.

This will be implemented during the user-account/database
portion of the thesis project.

I will write the MongoDB connection logic myself.
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

def connect_to_database():
    """
    TODO - Future Week

    Connect the backend to MongoDB.

    Things I will need to learn:

    - MongoDB connection strings
    - Environment variables
    - pymongo / MongoClient
    - How to safely store database credentials
    - How to handle connection errors
    """
    # Load variables from the .env file
    load_dotenv()
    
    # Get the MongoDB connection string from environment variables
    connection_string = os.getenv("MONGODB_URI")

    # Check if the connection string exists
    if not connection_string:
        # If the connection string is not found, raise an error
        raise ValueError(
            "MONGODB_URI was not found in the .env file"
        )

    # Create a MongoClient instance
    client = MongoClient(connection_string)

    # Test the connection to MongoDB
    client.admin.command("ping")

    # Get the database
    database = client["animatch"]

    # Return the database object
    return database


def get_users_collection():
    """
    TODO - Future Week

    Return the collection that stores user accounts
    and preference information.
    """
    # connect to the database
    database = connect_to_database()

    # get the users collection
    users_collection = database["users"]

    # return the users collection
    return users_collection

# testing mongodb connection
# if __name__ == "__main__":
#     database = connect_to_database()
#     print("Connected to MongoDB!")
#     print("Database:", database.name)