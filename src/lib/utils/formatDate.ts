export const formatDate = (date: string | undefined) => {
  if (!date) return "Sin fecha";
  try {
    const [year, month, day] = date.split("T")[0].split("-");
    if (!year || !month || !day) {
      return "Formato inválido";
    }
    return `${day}/${month}/${year}`;
  } catch {
    return "Sin fecha";
  }
};
