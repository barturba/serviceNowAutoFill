/**
 * Time calculation utilities
 */

function calculateTimeComponents(durationSeconds) {
  const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
  return { hours, mins, secs: '00' };
}

function calculateTimeWindow(durationSeconds) {
  const now = new Date();
  const startTime = new Date(now.getTime() - durationSeconds * 1000);
  return { now, startTime };
}

window.calculateTimeComponents = calculateTimeComponents;
window.calculateTimeWindow = calculateTimeWindow;

