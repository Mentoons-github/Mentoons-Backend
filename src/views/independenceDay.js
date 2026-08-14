const emailHtml = `<!doctype html>
<html
  lang="en"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Mentoons</title>
    <!--[if mso]>
      <style type="text/css">
        table {
          border-collapse: collapse;
        }
      </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #eaf6ff">
    <!-- Outer wrapper -->
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #eaf6ff"
    >
      <tr>
        <td align="center" style="padding: 24px 12px">
          <!-- Card container -->
          <table
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="max-width: 600px; width: 100%"
          >
            <!-- Heading -->
            <tr>
              <td
                align="center"
                style="
                  padding: 0 12px 16px 12px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 22px;
                  font-weight: bold;
                  color: #1a1a1a;
                "
              >
                Message from Mentoons
              </td>
            </tr>
            <!-- Clickable image -->
            <tr>
              <td style="padding: 0; line-height: 0; font-size: 0">
                <a
                  href="https://mentoons.com/sign-in"
                  target="_blank"
                  style="display: block; text-decoration: none; line-height: 0"
                >
                  <img
                    src="https://mentoons-products.s3.ap-northeast-1.amazonaws.com/uploads/OpinionJournal/1786535085185-da196590-2c0d-4dd2-8be6-acab81a04366.png"
                    alt="Digitally Independent Kids at Mentoons"
                    width="600"
                    style="
                      display: block;
                      width: 100%;
                      max-width: 600px;
                      height: auto;
                      border: 0;
                    "
                  />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

module.exports = emailHtml;
