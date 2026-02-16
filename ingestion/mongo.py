import os
from pymongo import MongoClient
 
 
def get_collection():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB", "mf-ai")
    client = MongoClient(uri)
    return client[db_name]["raw_logs"]