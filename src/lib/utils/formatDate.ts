export const formatDate = (date: string | undefined) => {
  if (!date) return "Sin fecha";
  const parseDate = date.split("T")[0];
  const formattedDate = parseDate.replace(/-/g, "/");
  const year = formattedDate.split("/")[0];
  const month = formattedDate.split("/")[1];
  const day = formattedDate.split("/")[2];
  const newDate = `${day}/${month}/${year}`;
  return newDate;
};
