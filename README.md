# lms-courses
Detta är ett projekt för att migrera kurser från KTHs interna system till Canvas LMS.

## För att komma igång:

clona detta repository.

Öppna en terminal och kör:

```npm install```

Och sen kör

```npm start```

och följ instruktionerna på skärmen

När programmet är klart har ett antal csv-filer skapats under katalogen csv.
Logga in i Canvas som administratör, och importera dessa filer mha SIS IMPORT

### Skapa fil med alla lärare
För att kunna komma åt information om personer i KTHs system måste man ange lösenord o dyl.

En fil med namnet .env ska skapas som ska innehålla detta data. Se filen .env.in för exempel på hur den ska se ut.


