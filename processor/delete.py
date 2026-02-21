from pprint import pprint
from mongo_reader import summary_collection
 
 
def clear_and_print_summary():
    col = summary_collection()
 
    # 1️⃣ Delete only summary documents
    delete_result = col.delete_many({})
    print(f"🧹 Deleted {delete_result.deleted_count} documents from SUMMARY collection\n")
 
    # 2️⃣ Print remaining data
    remaining = list(col.find({}))
    print("📄 Summary collection after cleanup:")
    if not remaining:
        print("✅ Summary collection is empty")
    else:
        for doc in remaining:
            pprint(doc)
 
 
if __name__ == "__main__":
    clear_and_print_summary()
 