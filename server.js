require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express().use(bodyParser.json()); 

app.listen(process.env.PORT);

app.post('/sendmail', function(req, res) {
  let { username, email, issues } = req.body;
  let issueItems = [];
  if (issues) {
     for (let { issueKey, issueTitle } of issues) {
      issueItems.push(`<li><b>${issueKey} - <em>${issueTitle}</em>.</b></li>`);
    }; 
  }
  const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const html = issueItems[0] ? `<p><b>Dear ${username},</b>
    <h3>You are receiving this because you left the following tasks on in-progress on JIRA:</h3>
    <ul>${issueItems.join()}</ul>
    <h5>You can safely ignore this email if you're still working on the mentioned issue(s).</h5>
    </p>` : `<p><b>Dear ${username},</b></p>
    <p><h3> You are receiving this because you left one or more tasks on in-progress on JIRA.</h3></p>
    <p><h5>You can safely ignore this email if you're still working on the mentioned issue(s).</h5></p>`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Jira Task(s) Still In Progress',
    html: html,
  };
  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) {
      res.send('An error occured');
    }
  });
  res.send('success');
});
