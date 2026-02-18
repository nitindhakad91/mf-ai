from mongo_db import summaries


def latest(limit: int = 10):
    col = summaries()
    return list(col.find().sort("created_at", -1).limit(limit))


def search(q: str, limit: int = 10):
    col = summaries()
    return list(col.find({"$or": [
        {"summary": {"$regex": q, "$options": "i"}},
        {"filename": {"$regex": q, "$options": "i"}}
    ]}).sort("created_at", -1).limit(limit))
