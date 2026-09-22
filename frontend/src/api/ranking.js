import API from "./api";

export async function fetchRankedResources({ facultyId, semester, subjectId, limit = 20, offset = 0}) {
  const { data } = await API.get("/resources/ranked", {
    params: { faculty_id: facultyId, semester, subject_id: subjectId, limit, offset },
  });
  return data;
}
