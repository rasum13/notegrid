export async function fetchUserProfile(supabase, userId) {
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      semester,
      reputation,
      faculty_id,
      faculties ( name ),
      votes ( type ),
      role,
      resources (
        title,
        subjects ( name ),
        votes ( type )
      )
    `)
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  return data;
}
