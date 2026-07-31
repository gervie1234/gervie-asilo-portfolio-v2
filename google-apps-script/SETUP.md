# Connect the portfolio form to Google Sheets + Gmail

The React form is already wired for one Google Apps Script web-app URL. Complete these account-side steps while signed in as **gervieasilo@gmail.com**.

1. Create a Google Sheet named **Gervie Asilo Portfolio Inquiries**.
2. In the Sheet, open **Extensions → Apps Script**.
3. Replace the editor contents with the complete contents of **Code.gs** from this folder.
4. Choose the **setup** function and click **Run** once.
5. Review and approve Google Sheets and email permissions. The script stores the Sheet ID and formats the **Inquiries** tab.
6. Open **Deploy → New deployment → Web app**.
7. Set **Execute as: Me** and **Who has access: Anyone**.
8. Deploy and copy the Web app URL ending in **/exec**.
9. In the React project root, create **.env.local** containing:

   VITE_CONTACT_FORM_ENDPOINT=PASTE_YOUR_WEB_APP_EXEC_URL_HERE

10. Restart the Vite server with **npm run dev**.

Do not commit .env.local. The browser must know the public web-app endpoint to submit, so protect the form with the included validation and honeypot and monitor Apps Script quotas.
