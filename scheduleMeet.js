const nodemailer = require("nodemailer");
const ical = require("ical-generator").default;
const { format } = require('date-fns');

async function sendMeetingEmails(attendees, title, description, date, time) {
  try {
    // Parse date and time strings into Date objects
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Calculate the start and end times
    const startTime = new Date(year, month - 1, day, hour, minute);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes meeting

    // Create an iCal event
    const calendar = ical({ name: 'ProTrackr Meeting' });
    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: title,
      description: description,
      location: 'My Office',
      url: 'http://sebbo.net/',
      method: 'REQUEST' // Ensure the method is set to REQUEST
    });

    // Generate the iCal attachment
    const icsAttachment = {
      filename: "meeting.ics",
      content: calendar.toString(),
      contentType: "text/calendar",
    };

    // Format the date and time for email
    const formattedDate = format(startTime, "MMMM do, yyyy"); // e.g., May 25th, 2024
    const formattedTime = format(startTime, "h:mm a"); // e.g., 1:51 PM

    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "ProTrackr@hotmail.com",
        pass: "1234admin1234", // Replace with your actual password or use environment variables
      },
    });

    // Email details
    let mailOptions = {
      from: "ProTrackr <ProTrackr@hotmail.com>",
      to: attendees.join(", "),
      subject: title,
      text: `${description}\n\nThe Meeting is Scheduled on the following Date & Time. \nAll Attendees take notice! \n\nDate: ${formattedDate}\nTime: ${formattedTime}`,
      // Attach the iCal file
      attachments: [icsAttachment],
    };

    // Send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow the error to handle it in the caller function
  }
}

module.exports = { sendMeetingEmails };
