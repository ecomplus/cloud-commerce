export default (date: Date) => {
  const d = new Date(date.getTime() - (3 * 60 * 60 * 1000));
  return d.getDate().toString().padStart(2, '0') + '/'
    + (d.getMonth() + 1).toString().padStart(2, '0') + '/'
    + d.getFullYear();
};
