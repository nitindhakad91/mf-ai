import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

_client = None


def _db():
    global _client
    if _client is None:
        _client = MongoClient(os.getenv("MONGO_URI"))
    return _client[os.getenv("MONGO_DB", "mf-ai")]


def summary_collection():
    return _db()[os.getenv("SUMMARY_COLLECTION", "log_summaries")]


def print_summaries():
    col = summary_collection()
    for d in col.find().sort("created_at", -1):
        print("\n" + "=" * 80)
        print(d.get("filename"))
        print(d.get("summary"))
        print("=" * 80)

print_summaries()