export function formatDate(input: string | Date, format: string): string {
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const map: { [key: string]: string | number } = {
    yyyy: date.getFullYear(),
    mm: pad(date.getMonth() + 1),
    MMM: shortMonths[date.getMonth()],
    dd: pad(date.getDate()),
    hh: pad(hours12),
    HH: pad(hours24),
    MM: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    A: ampm,
  };

  return format.replace(/yyyy|mm|MMM|dd|hh|HH|MM|ss|A/g, match => String(map[match]));
}
