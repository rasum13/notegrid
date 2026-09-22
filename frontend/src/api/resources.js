export const VOTE_POINTS = { UPVOTE: 1, DOWNVOTE: -1 };

export function computeScore(votes) {
  return votes.reduce((sum, v) => sum + (VOTE_POINTS[v.type] ?? 0), 0);
}

export async function fetchResourcesFeed(supabase) {
  const { data, error } = await supabase
    .from("resources")
    .select(`
      id,
      created_at,
      title,
      description,
      score,
      resource_type,
      file_path,
      file_type,
      url,
      subjects ( id, name, subject_code ),
      uploader:profiles ( id, full_name ),
      votes ( type, voter_id )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchSubjects(supabase, { facultyId, semester }) {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("faculty_id", facultyId)
    .eq("semester", semester)
    .order("name");

  if (error) throw error;
  return data;
}

// Toggles a vote: same type again removes it, different type flips it,
// no existing vote inserts one. Returns the resulting vote type (or null)
// plus the score delta so the UI can update optimistically.
export async function castVote(supabase, { resourceId, voterId, type }) {
  const { data, error } = await supabase.rpc("toggle_vote", {
    p_resource_id: resourceId,
    p_voter_id: voterId,
    p_type: type,
  });
  if (error) throw error;
  return data;
}

export async function fetchResourceById(supabase, id) {
  const { data, error } = await supabase
    .from("resources")
    .select(`
      id,
      created_at,
      title,
      description,
      resource_type,
      file_path,
      file_type,
      url,
      subjects ( id, name, subject_code ),
      uploader:profiles ( id, full_name ),
      votes ( type, voter_id )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRelatedResources(supabase, { subjectId, excludeId }) {
  const { data, error } = await supabase
    .from("resources")
    .select(`
      id,
      title,
      votes ( type )
    `)
    .eq("subject_id", subjectId)
    .neq("id", excludeId)
    .limit(5);

  if (error) throw error;
  return data;
}
