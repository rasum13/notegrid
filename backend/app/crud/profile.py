from app.core.supabase import supabase
def get_user_profile(id: str):
    res = supabase.table("profiles") \
        .select("*") \
        .eq("id", id) \
        .single() \
        .execute()
    return res.data
