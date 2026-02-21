from mongo import get_collection
from pprint import pprint
 
def clear_and_print_collection():
    col = get_collection()
 
    # Step 1: Delete all documents
    delete_result = col.delete_many({})
    print(f"✅ Deleted {delete_result.deleted_count} documents from the collection\n")
 
    # Step 2: Fetch remaining documents
    remaining_docs = list(col.find({}))
 
    # Step 3: Print remaining data
    print("📄 Data in collection after cleanup:")
    if not remaining_docs:
        print("✅ Collection is empty")
    else:
        for doc in remaining_docs:
            pprint(doc)
 
if __name__ == "__main__":
    clear_and_print_collection()