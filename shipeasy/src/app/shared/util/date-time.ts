export function currentTime(selectedDate: Date): Date {
    const currentDate = new Date();
    const dateWithCurrentTime = new Date(selectedDate);
    dateWithCurrentTime.setHours(23);
    dateWithCurrentTime.setMinutes(59);
    dateWithCurrentTime.setSeconds(0);
    dateWithCurrentTime.setMilliseconds(0);
  
    return dateWithCurrentTime;
  }