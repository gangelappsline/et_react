import React from 'react';

function ymdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeeks(year, month) {
  // Monday-first calendar (0..6 where 0=Mon)
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7; // shift so Monday=0

  const cells = [];
  // leading days from previous month
  for (let i = 0; i < startOffset; i++) {
    const date = new Date(year, month, -i);
    cells.unshift({ date, inMonth: false });
  }
  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  // trailing days to fill 6x7 grid
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  // ensure 6 weeks for stable layout
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export default function MonthCalendar({
  year,
  month, // 0..11
  countsByDay = {}, // { 'YYYY-MM-DD': number }
  selectedKey,
  onSelect,
  onPrevMonth,
  onNextMonth,
}) {
  const weeks = React.useMemo(() => getWeeks(year, month), [year, month]);
  const todayKey = ymdLocal(new Date());
  const monthName = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekdayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="flex items-center justify-between p-3 border-b">
        <button type="button" onClick={onPrevMonth} className="px-2 py-1 rounded hover:bg-gray-100">←</button>
        <div className="font-semibold capitalize">{monthName}</div>
        <button type="button" onClick={onNextMonth} className="px-2 py-1 rounded hover:bg-gray-100">→</button>
      </div>
      <div className="grid grid-cols-7 text-xs text-gray-500 px-2 pt-2">
        {weekdayNames.map((w) => (
          <div key={w} className="px-2 py-1 text-center font-medium">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 p-2">
        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map(({ date, inMonth }) => {
              const key = ymdLocal(date);
              const count = countsByDay[key] || 0;
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect && onSelect(key)}
                  className={
                    'h-20 rounded border p-2 text-left flex flex-col justify-between transition ' +
                    (isSelected ? 'border-teal-600 shadow' : 'border-gray-200') + ' ' +
                    (inMonth ? 'bg-white hover:bg-teal-50' : 'bg-gray-50 text-gray-400')
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className={isToday ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs' : 'text-sm text-gray-700'}>
                      {date.getDate()}
                    </span>
                    {count > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">{count}</span>
                    )}
                  </div>
                  {/* Placeholder for events preview in the cell if needed */}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export { ymdLocal };
