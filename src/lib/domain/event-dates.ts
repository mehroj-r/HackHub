// Event days in Tashkent time (docs/08 > Dates and times). Pure: no Prisma
// or Next.js imports. Event dates are stored as a calendar day at UTC
// midnight (`@db.Date`); the day itself runs in GMT+5.

const DAY_MS = 24 * 60 * 60 * 1000;
const GMT_PLUS_5_MS = 5 * 60 * 60 * 1000;

/** True once the event's last day is over in GMT+5, i.e. from 00:00 the next day in Tashkent. */
export function isAfterLastDay(endDate: Date, now: Date): boolean {
  const endOfLastDayUtc = endDate.getTime() + DAY_MS - GMT_PLUS_5_MS;
  return now.getTime() >= endOfLastDayUtc;
}
