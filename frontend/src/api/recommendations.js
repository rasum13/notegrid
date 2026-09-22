import API from "./api";

export async function fetchRecommendations(userId, limit = 5) {
  const { data } = await API.get("/recommendations", {
    params: { user_id: userId, limit },
  });
  return data.results; // array of resources with a `reason` field
}
