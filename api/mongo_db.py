import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()


def db():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGO_DB", "mf-ai")
    return MongoClient(uri)[db_name]


def summaries():
    return db()[os.getenv("SUMMARY_COLLECTION", "log_summaries")]
