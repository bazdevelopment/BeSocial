import { IResetPasswordTemplate } from './reset-password-confirmation-template.interface';

/**
 * HTML template received by the used on his email address
 * Is a confirmation of the successful reset of the login password
 */
export const resetPasswordTemplate = ({
  username,
  email,
  ipAddress,
  date,
  imageUrl = 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
}: IResetPasswordTemplate): string => {
  return `<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f7f7f7">
  <tbody>
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f7f7f7">
          <tbody>
            <tr>
              <td class="m_8415581259083956697header" style="padding: 12px 0 0" align="center">
                <table width="620" border="0" cellspacing="0" cellpadding="0" class="m_8415581259083956697mobile-shell">
                  <tbody>
                    <tr>
                      <td class="m_8415581259083956697td" style="
                                                  width: 620px;
                                                  min-width: 620px;
                                                  font-size: 0;
                                                  line-height: 0;
                                                  font-weight: normal;
                                                  margin: 0;
                                                  padding: 0;
                                              ">
                        <table class="m_8415581259083956697header" width="100%" border="0" cellspacing="0"
                          cellpadding="0" bgcolor="#f7f7f7">
                          <tbody>
                            <tr>
                              <td class="m_8415581259083956697header-inner" style="padding: 40px 15px">
                                <div style="font-size: 0; line-height: 0" align="center">
                                  <a href="" style="text-decoration: none; color: inherit"
                                    target="_blank" data-saferedirecturl="">
                                    <img src=${imageUrl} border="0" width="180" height="90" alt=""
                                      class="CToWUd" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td align="center">
                <table width="620" border="0" cellspacing="0" cellpadding="0" class="m_8415581259083956697mobile-shell">
                  <tbody>
                    <tr>
                      <td class="m_8415581259083956697td" style="
                                                  width: 620px;
                                                  min-width: 620px;
                                                  font-size: 0;
                                                  line-height: 0;
                                                  font-weight: normal;
                                                  margin: 0;
                                                  padding: 0;
                                              ">
                        <table class="m_8415581259083956697main-table" width="100%" border="0" cellspacing="0"
                          cellpadding="0" bgcolor="#ffffff" style="border-radius: 10px">
                          <tbody>
                            <tr>
                              <td style="padding: 0">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                  <tbody>
                                    <tr>
                                      <td style="padding: 40px 46px">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                            <tr>
                                              <td>
                                                <div class="m_8415581259083956697h1-mobile-medium" style="
                                                                                                      color: #50b5ff;
                                                                                                      font-family: 'Open Sans', sans-serif;
                                                                                                      font-size: 24px;
                                                                                                      line-height: 30px;
                                                                                                      letter-spacing: 0;
                                                                                                      font-weight: 600;
                                                                                                  " align="left">
                                                  Password Change Confirmation
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td height="32" style="
                                                                                                  font-size: 0;
                                                                                                  line-height: 0;
                                                                                                  width: 100%;
                                                                                                  min-width: 100%;
                                                                                              " align="center"></td>
                                            </tr>
                                            <tr>
                                              <td style="padding-bottom: 10px">
                                                <div style="
                                                                                                      color: #333333;
                                                                                                      font-family: 'Open Sans', sans-serif;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 26px;
                                                                                                      font-weight: bold;
                                                                                                  "
                                                  class="m_8415581259083956697text" align="left">
                                                  Dear ${username},
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style="padding-bottom: 36px">
                                                <div class="m_8415581259083956697text" style="
                                                                                                      color: #333333;
                                                                                                      font-family: 'Open Sans', sans-serif;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 26px;
                                                                                                  " align="left">
                                                  You password was successfully changed.
                                                </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="left">
                                                <table width="300" border="0" cellspacing="0" cellpadding="0"
                                                  bgcolor="#50b5ff" style="background: none">
                                                  <tbody>
                                                    <tr>
                                                      <td width="100%" align="left" style="color: #50b5ff">
                                                        Email: ${email}
                                                      </td>
                                                    </tr>
                                                    <tr>
                                                      <td width="100%" align="left" style="color: #50b5ff">
                                                        IP Address: ${ipAddress}
                                                      </td>
                                                    </tr>
                                                    <tr>
                                                      <td width="100%" align="left" style="color: #50b5ff">
                                                        Created: ${date}
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td style="padding-top: 22px">
                                                <div class="m_8415581259083956697text" style="
                                                                                                      color: #333333;
                                                                                                      font-family: 'Open Sans', sans-serif;
                                                                                                      font-size: 16px;
                                                                                                      line-height: 33px;
                                                                                                  " align="left">
                                                  <span class="il">Chatty App</span> Team
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;
};
