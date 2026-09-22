export async function uploadResource(supabase, file, title, description, file_type) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { fileData, error: fileError } = await supabase.storage
    .from("resources")
    .upload(filePath, file);

  if (fileError) {
    console.error("Upload error:", fileError);
    return null;
  }

  const { dbData, dbError } = await supabase.from("resources").insert({
    title: title,
    type: "FILE",
    description: description,
    file_path: filePath,
    file_type: file_type
  });

  if (dbError) {
    console.error("Upload error:", fileError);
    return null;
  }

  return getFileUrl(supabase, filePath);
}

export function getFileUrl(supabase, path) {
  const { data } = supabase.storage
    .from("resources")
    .getPublicUrl(path);

  return data.publicUrl;
}
