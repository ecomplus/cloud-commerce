import range0 from './deadlines/range-0.mjs';
import range1 from './deadlines/range-1.mjs';
import range2 from './deadlines/range-2.mjs';
import range3 from './deadlines/range-3.mjs';
import range4 from './deadlines/range-4.mjs';
import range5 from './deadlines/range-5.mjs';
import range6 from './deadlines/range-6.mjs';
import range7 from './deadlines/range-7.mjs';
import range8 from './deadlines/range-8.mjs';
import range9 from './deadlines/range-9.mjs';

const deadlineRanges = [
  range0,
  range1,
  range2,
  range3,
  range4,
  range5,
  range6,
  range7,
  range8,
  range9,
];

export default ({ cepori, cepdes, modalidade }) => {
  const isExpress = !modalidade || modalidade <= 7;
  let days = deadlineRanges[parseInt(cepori.charAt(0), 10)](cepdes, isExpress);
  if (cepori > 19999999 && Math.abs(cepori - cepdes) > 4000000) {
    days += (isExpress ? 1 : 2);
  }
  return days;
};
