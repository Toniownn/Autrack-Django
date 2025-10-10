export const getImgUrl = (imageName: string) => {
  try {
    return new URL(`../assets/rooms/${imageName}`, import.meta.url).href;
  } catch {
    console.warn(`Image not found: ${imageName}`);
    return "";
  }
};
