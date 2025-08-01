export async function translateBrailleImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/api/image-translate", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al traducir la imagen.");
  return res.json();
}
