// Live "open now" badge for the boutique, computed in the boutique's own time
// zone so it is right wherever the visitor is. Opening hours come from the
// element's data attributes:
//   data-timezone="Europe/Paris"  data-days="2,3,4,5,6,0" (0 = Sunday)
//   data-opens="07:00"            data-closes="14:00"

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const REFRESH_MS = 60_000;

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

function describeOpening({ days, opens, closes }, { weekday, minutes }) {
  if (days.includes(weekday) && minutes < closes) {
    return minutes >= opens
      ? { open: true, text: `Open now · until ${formatTime(closes)}` }
      : { open: false, text: `Opens today at ${formatTime(opens)}` };
  }
  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = (weekday + ahead) % 7;
    if (days.includes(day)) {
      const when = ahead === 1 ? 'tomorrow' : WEEKDAYS[day];
      return { open: false, text: `Closed · opens ${when} at ${formatTime(opens)}` };
    }
  }
  return { open: false, text: 'Closed' };
}

function formatTime(minutes) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

export function setupOpenStatus(elements) {
  if (elements.length === 0) return;

  const render = () => {
    for (const element of elements) {
      const { timezone, days, opens, closes } = element.dataset;
      const status = describeOpening(
        { days: days.split(',').map(Number), opens: toMinutes(opens), closes: toMinutes(closes) },
        localNow(timezone),
      );
      element.dataset.open = String(status.open);
      element.querySelector('[data-open-text]').textContent = status.text;
    }
  };

  render();
  setInterval(render, REFRESH_MS);
}
