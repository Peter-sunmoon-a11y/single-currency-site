import dayjs from "dayjs";

export const formatDateTime = (date: string | number, format = "DD/MM/YYYY HH:mm:ss") => {
  return dayjs(date).format(format);
};
