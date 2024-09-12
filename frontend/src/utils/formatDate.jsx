import moment from "moment";
export const formatDateTime = (time) => {
  const newTime = moment(time).format("DD/MM/YYYY HH:mm:ss");
  return newTime;
};

export const formatDate = (time) => {
  const newTime = moment(time).format("DD/MM/YYYY");
  return newTime;
};

export const formatTime = (time) => {
  const newTime = moment(time).format("HH:mm:ss");
  return newTime;
};
