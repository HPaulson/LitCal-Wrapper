export function produceIcal(data: Array<Record<string, any>>): string {
  const publishDate =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let ical = "BEGIN:VCALENDAR\r\n";
  ical += "PRODID:-//John Romano D'Orazio//Liturgical Calendar V1.0//EN\r\n";
  ical += "VERSION:2.0\r\n";
  ical += "CALSCALE:GREGORIAN\r\n";
  ical += "METHOD:PUBLISH\r\n";
  ical += "X-MS-OLK-FORCEINSPECTOROPEN:FALSE\r\n";
  ical += `X-WR-CALNAME:Roman Catholic Universal Liturgical Calendar\r\n`;
  ical += "X-WR-TIMEZONE:Europe/Vatican\r\n";
  ical += "X-PUBLISHED-TTL:PT1D\r\n";

  for (const [festivityKey, calEvent] of Object.entries<any>(data)) {
    const displayGrade = calEvent?.grade_display || "";
    let description = `${calEvent.common || ""}\n${displayGrade || ""}`;

    if (calEvent.color && calEvent.color.length > 0) {
      description += `\n${calEvent.color}`;
    }
    if (calEvent.liturgical_year) {
      description += `\n${calEvent.liturgical_year}`;
    }

    const icalDate = new Date(calEvent.date * 1000)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const uid = `LITCAL-${festivityKey}-${icalDate}`;

    ical += "BEGIN:VEVENT\r\n";
    ical += "CLASS:PUBLIC\r\n";
    ical += `DTSTART;VALUE=DATE:${icalDate}\r\n`;
    ical += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\n`;
    ical += `UID:${uid}\r\n`;
    ical += `CREATED:${publishDate}\r\n`;

    const desc = `DESCRIPTION:${description}\r\n`;
    ical +=
      desc.length > 75
        ? desc.match(/.{1,75}/g)?.join("\r\n ") + "\r\n"
        : desc + "\r\n";

    ical += `LAST-MODIFIED:${publishDate}\r\n`;
    ical +=
      calEvent.name && `SUMMARY:${calEvent.name.replace(/,/g, "\\,")}\r\n`;
    ical += "TRANSP:TRANSPARENT\r\n";
    ical += "X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\r\n";
    ical += "X-MICROSOFT-DISALLOW-COUNTER:TRUE\r\n";
    ical += "END:VEVENT\r\n";
  }

  ical += "END:VCALENDAR";
  return ical;
}
