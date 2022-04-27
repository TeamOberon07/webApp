# webAppOberon
Repo per lo sviluppo della webApp del Team Oberon

Una volta aperta la cartella da terminale lanciare i comandi:
1) npm install
2) npm start
Una volta fatto vi si aprirà una finestra del vostro browser all'indirizzo "http://localhost:3000/" con la vostra app con vista Seller se siete connessi con l'address del Seller, altrimenti con vista Buyer con qualsiasi altro indirizzo.
Dalla webApp è possibile accedere anche alle seguenti pagine:
- Register Seller, per registrare un indirizzo come Seller, tramite l' URL "http://localhost:3000/register-seller";
- Landing Page, per creare un nuovo ordine.
Per accedere alla Landing Page bisognerà prima far partire il server dell'e-commerce tramite terminale (vedi "https://github.com/TeamOberon07/mock_e-commerce") e sucessivamente collegarsi all'url "http://localhost:3000/landingpage?order=X" , con al posto di 'X' l'id dell'ordine che si vuole creare.