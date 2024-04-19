const userModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL = process.env.EMAIL; 
const PASSWORD = process.env.PASSWORD; // Your email password

const emailSender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    }
});

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const verificationToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1d' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
        });

        const verificationLink = `https://shoespotter.onrender.com/auth/verify?token=${verificationToken}`;

        const mailOptions = {
            from: EMAIL,
            to: email,
            subject: 'Email Verification',
            text: `Click the following link to verify your email: ${verificationLink}`,
            html: `<head>
            <title></title>
            <!--[if !mso]><!-- -->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <style type="text/css">
              #outlook a {
                padding: 0;
              }
          
              .ReadMsgBody {
                width: 100%;
              }
          
              .ExternalClass {
                width: 100%;
              }
          
              .ExternalClass * {
                line-height: 100%;
              }
          
              body {
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
              }
          
              table,
              td {
                border-collapse: collapse;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
              }
          
              img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                -ms-interpolation-mode: bicubic;
              }
          
              p {
                display: block;
                margin: 13px 0;
              }
            </style>
            <!--[if !mso]><!-->
            <style type="text/css">
              @media only screen and (max-width:480px) {
                @-ms-viewport {
                  width: 320px;
                }
          
                @viewport {
                  width: 320px;
                }
              }
            </style>
            <!--<![endif]-->
            <!--[if mso]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
            <!--[if lte mso 11]>
          <style type="text/css">
            .outlook-group-fix {
              width:100% !important;
            }
          </style>
          <![endif]-->
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
            <style type="text/css">
              @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
            </style>
            <!--<![endif]-->
            <style type="text/css">
              @media only screen and (min-width:480px) {
          
                .mj-column-per-100,
                * [aria-labelledby="mj-column-per-100"] {
                  width: 100% !important;
                }
              }
            </style>
          </head>
          
          <body style="background: #F9F9F9;">
            <div style="background-color:#F9F9F9;">
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
              <style type="text/css">
                html,
                body,
                * {
                  -webkit-text-size-adjust: none;
                  text-size-adjust: none;
                }
          
                a {
                  color: #1EB0F4;
                  text-decoration: none;
                }
          
                a:hover {
                  text-decoration: underline;
                }
              </style>
              <div style="margin:0px auto;max-width:640px;background:transparent;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0">
                  <tbody>
                    <tr>
                      <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 0px;">
                        <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">
                <![endif]-->
                        <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td style="word-break:break-word;font-size:0px;padding:0px;" align="center">
                                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                                    
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
              <div style="max-width:640px;margin:0 auto;box-shadow:0px 1px 5px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden">
                <div style="margin:0px auto;max-width:640px;background:#7289DA url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png) top center / cover no-repeat;">
                  <!--[if mso | IE]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">
                  <v:fill origin="0.5, 0" position="0.5,0" type="tile" src="https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png" />
                  <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                <![endif]-->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#7289DA url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png) top center / cover no-repeat;" align="center" border="0" background="https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png">
                    <tbody>
                      <tr>
                        <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:57px;">
                          <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:undefined;width:640px;">
                <![endif]-->
                          <div style="cursor:auto;color:white;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:36px;font-weight:600;line-height:36px;text-align:center;">Welcome to Shoepotter!</div>
                          <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!--[if mso | IE]>
                  </v:textbox>
                </v:rect>
                <![endif]-->
                </div>
                <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
                <div style="margin:0px auto;max-width:640px;background:#ffffff;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 70px;">
                          <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">
                <![endif]-->
                          <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="word-break:break-word;font-size:0px;padding:0px 0px 20px;" align="left">
                                    <div style="cursor:auto;color:#737F8D;font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:16px;line-height:24px;text-align:left;">
                                      <p><img src="https://www.shutterstock.com/image-vector/clap-hand-icon-isolated-on-600nw-1781394782.jpg" alt="Party Wumpus" title="None" width="500" style="height: auto;"></p>
          
                                      <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 20px;color: #4F545C;letter-spacing: 0.27px;">Hey ${username},</h2>
                                      <p>Wowwee! Thanks for registering an account with Shoespotter! You're the coolest person in all the land (and I've met a lot of really cool people).</p>
                                      <p>Before we get started, we'll need to verify your email.</p>
          
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="word-break:break-word;font-size:0px;padding:10px 25px;" align="center">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
                                      <tbody>
                                        <tr>
                                          <td style="border:none;border-radius:3px;color:white;cursor:auto;padding:15px 19px;" align="center" valign="middle" bgcolor="#7289DA"><a href=${verificationLink} style="text-decoration:none;line-height:100%;background:#7289DA;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:15px;font-weight:normal;text-transform:none;margin:0px;" target="_blank">
                                              Verify Email
                                            </a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
              </div>
              <div style="margin:0px auto;max-width:640px;background:transparent;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0">
                  <tbody>
                    <tr>
                      <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px;">
                        <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">
                <![endif]-->
                        <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                            <tbody>
                              <tr>
                                <td style="word-break:break-word;font-size:0px;">
                                  <div style="font-size:1px;line-height:12px;">&nbsp;</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
              <div style="margin:0 auto;max-width:640px;background:#ffffff;box-shadow:0px 1px 5px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;">
                <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;" align="center" border="0">
                  <tbody>
                    <tr>
                      <td style="text-align:center;vertical-align:top;font-size:0px;padding:0px;">
                        <!--[if mso | IE]>
                <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">
                <![endif]-->
                        <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
              <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px;">
                  <tr>
                    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                <![endif]-->
              <div style="margin:0px auto;max-width:640px;background:transparent;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0">
                  <tbody>
                    <tr>
                      <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
                        <!--[if mso | IE]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:640px;">
                </td></tr></table>
                <![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]>
                </td></tr></table>
                <![endif]-->
            </div>
          
          </body>`,
        };

        emailSender.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        // res.cookie("authToken", verificationToken, {
        //     httpOnly: true,
        //     sameSite: "lax",
        //     maxage: 1000 * 60 * 60 * 24 * 7   // 7 days
        // });

        // res.cookie("userId", user._id, {
        //     httpOnly: false,
        // });

        return res.status(201).json({ result: user, message: "User created successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" }); // 500 means server error
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist" }); // 404 means not found
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" }); // 400 means bad request
        }
        if(existingUser.isVerified === false) {
          return res.status(401).json({ message: "Email not verified" });
        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser.username }, SECRET_KEY, { expiresIn: '1d' });
        
        // res.setHeader('Authorization', `Bearer ${token}`); // Set the Authorization header

        res.cookie("authToken", token, {
            httpOnly: true,
            sameSite: "lax",
            maxage: 1000 * 60 * 60 * 24 * 1    // 1 days
        });

        res.status(200).json({ emailId : existingUser.email, userName: existingUser.username, token: token, message: "Login Sucessfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" }); // 500 means server error
    }
}

const verify = async (req, res) => {
    const token = req.query.token;
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const email = decodedToken.email;

        const user = await userModel.findOne({ email, verificationToken: token });

        if (!user) {
            return res.status(404).json({ message: "Invalid verification token" });
        }

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = undefined; // Remove verification token
        await user.save();

        // res.status(200).json({ message: "Email verified successfully" });
        res.render('verify');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Email verification failed" });
    }
};

const logout = async (req, res) => {
    res.clearCookie("authToken");
    res.clearCookie("userId");
    res.redirect('/auth/login');
}


module.exports = { signup, login, logout, verify }