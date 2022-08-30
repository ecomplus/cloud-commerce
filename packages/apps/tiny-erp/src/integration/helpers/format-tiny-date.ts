export default (d: Date) => {
  /* eslint-disable prefer-template */
  return d.getDate().toString().padStart(2, '0') + '/'
    + (d.getMonth() + 1).toString().padStart(2, '0') + '/'
    + d.getFullYear();
};
