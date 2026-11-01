// Live status of the boutique and its ovens, computed in the boutique's own
// time zone so it is right wherever the visitor is. The schedule comes from
// the element's data attributes:
//   data-timezone="Europe/Paris"  data-days="2,3,4,5,6,0" (0 = Sunday)
//   data-opens="07:00"            data-closes="14:00"
//   data-trays="07:00,08:30,10:00" (optional) times a tray leaves the oven
// The element keeps its static text when scripts do not run.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const REFRESH_MS = 30_000;

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Weekday (0 = Sunday) and minutes since midnight in `timeZone`.
function localNow(timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return {
    weekday: WEEKDAYS.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function formatTime(minutes) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

function formatWait(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest === 0 ? `${minutes / 60} h` : `${Math.floor(minutes / 60)} h ${rest} min`;
}

// The next day the boutique opens, counted from `weekday`, as a word.
function nextOpeningDay(days, weekday) {
  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = (weekday + ahead) % 7;
    if (days.includes(day)) return ahead === 1 ? 'tomorrow' : WEEKDAYS[day];
  }
  return null;
}

function describe({ days, opens, closes, trays }, { weekday, minutes }) {
  const openToday = days.includes(weekday);
  const firstTray = trays[0] ?? opens;

  if (openToday && minutes < opens) {
    return { open: false, text: `First tray today at ${formatTime(firstTray)}` };
  }
  if (openToday && minutes < closes) {
    const nextTray = trays.find((tray) => tray > minutes);
    if (nextTray === undefined) {
      return { open: true, text: `Open until ${formatTime(closes)} · last tray is out` };
    }
    return {
      open: true,
      text: `Next tray at ${formatTime(nextTray)} · in ${formatWait(nextTray - minutes)}`,
    };
  }
  const day = nextOpeningDay(days, weekday);
  return { open: false, text: day ? `Closed · first tray ${day} at ${formatTime(firstTray)}` : 'Closed' };
}

export function setupOpenStatus(elements) {
  if (elements.length === 0) return;

  const render = () => {
    for (const element of elements) {
      const { timezone, days, opens, closes, trays } = element.dataset;
      const status = describe(
        {
          days: days.split(',').map(Number),
          opens: toMinutes(opens),
          closes: toMinutes(closes),
          trays: trays ? trays.split(',').map(toMinutes).sort((a, b) => a - b) : [],
        },
        localNow(timezone),
      );
      element.dataset.open = String(status.open);
      element.querySelector('[data-open-text]').textContent = status.text;
    }
  };

  render();
  setInterval(render, REFRESH_MS);
}
