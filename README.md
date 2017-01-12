# Cayley

This is a Node.js client for open-source graph database [cayley](https://github.com/cayleygraph/cayley).

## Documentation

### Basic usages examples

```
npm install node-cayley --save
```

```
// Watch: here the lib will return a cayley clients array for supporting multiple cayley hosts,
// for more information like the default client slection strategy, please continue reading this doc.

const cayleyClients = require('node-cayley')('http://localhost:64210');
```
  * Write your JSON object directly to cayley, this lib will handle the JSON to nquad transparently for you.

    ```
    # Callback style.
    cayleyClients[0].write([
      {
        primaryKey: '</user/shortid/23TplPdS>',
        label: 'companyA',

        userId: '23TplPdS',
        realName: 'XXX_L3',
        mobilePhone: {
          isVerified: false,
          alpha3CountryCode: '+65',
          mobilePhoneNoWithCountryCallingCode: '+6586720011'
        }
      }
    ], (err, resBody) => {
      if (err) {
        // Something went wrong...
      } else {
        // You get the response body here.
      }
    });
    ```

    ```
    # Bluebird Promise style.
    cayleyClients[0].write([
      {
        primaryKey: '</user/shortid/23TplPdS>',
        label: 'companyA',

        userId: '23TplPdS',
        realName: 'XXX_L3',
        mobilePhone: {
          isVerified: false,
          alpha3CountryCode: '+65',
          mobilePhoneNoWithCountryCallingCode: '+6586720011'
        }
      }
    ]).then((resBody) => {
      // You get the response body here.
    }).catch((err) => {
      // Something went wrong...
    });
    ```

  * Use Gremlin APIs, refer to official [Gremlin APIs doc](https://github.com/cayleygraph/cayley/blob/master/docs/GremlinAPI.md) for more information.

    ```
    # Callback style.
    cayleyClients[0].g.type('query').V().All((err, resBody) => {
      // Callback body here...
    });
    ``` 

    ```
    # Bluebird Promise style.
    cayleyClients[0].g.type('query').V().All().then((resBody) => {
      // You get the response body here.
    }).catch((err) => {
      // Something went wrong...
    });
    ```

  * For all the APIs usages example you can find in the [test folder](./test/apis).


