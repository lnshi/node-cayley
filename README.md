# node-cayley

This is a Node.js client for open-source graph database [cayley](https://github.com/cayleygraph/cayley).

## Feature list

* ES6 based.
* TLS supported.
* Multiple cayley hosts supported.
* Default random client selection strategy.
* Bluebird Promise style and callback style APIs.
* Transparent bidirectional JSON <-> N-Quads data formatting handling.
* Fully covered mocha + chai test cases.
* Clearly designed entry-level N-Quads data: [friend_circle_with_label.nq](./test/data/friend_circle_with_label.nq), [friend_circle_without_label.nq](./test/data/friend_circle_without_label.nq) for getting you in.

# Documentation

## Table of Contents

## Basic usages examples

```
npm install node-cayley --save
```

```javascript
const client = require('node-cayley')('localhost:64210');

const g = graph = client.g; // Or: const g = graph = client.graph;

client.write(jsonObjArr).then((res) => {
  // Successfully wrote to cayley.
}).catch((err) => {
  // ...
});

client.read().then((res) => {
  // Your data in JSON.
}).catch((err) => {
  // ...
});

client.delete(jsonObjArr, (err, res) => {
  // Callback style.
});

g.V().All().then((res) => {
  // Your data in JSON.
}).catch((err) => {
  // ...
});

// 'type' default to 'query', you can change to 'shape' by calling g.type('shape')
g.type('shape').V().All((err, res) => {
  // Callback style.
});
```

## Configuration

  * Options

    * logLevel: `integer`, set log level, this lib use logger winston and npm log levels(winston.config.npm.levels).

    * promisify: `boolean`, set true to use bluebird style APIs, false to use callback style APIs.

    * secure: `boolean`, set whether your cayley server use TLS.

    * certFile: `string`, path of your TLS cert file, if above 'secure' is set to true, this must be provided.

    * keyFile: `string`, path of your TLS key file, if above 'secure' is set to true, this must be provided.

    * caFile: `string`, path of your TLS root CA file, if above 'secure' is set to true, this must be provided.

    * servers: `Array of multiple cayley hosts object`, options here will override the top level options.

  * Two configuration examples

    ```javascript
    const client = require('node-cayley')('localhost:64210');
    const g = graph = client.g;
    ```
    ```javascript
    const clients = require('node-cayley')({
      promisify: true,
      secure: true,
      certFile: '',
      keyFile: '',
      caFile: '',
      servers: [
        {
          host: host_0,
          port: port_0
        }, {
          host: host_1,
          port: port_1,
          secure: false
        }
      ]
    });

    clients.pickRandomly().read().then((res) => {/* Your data in JSON. */}).catch((err) => {});

    const g = graph = clients.pickRandomly().g;

    g.V().All().then((res) => {/* Your data in JSON. */}).catch((err) => {});
    ```

## Default random client selection strategy

  * If single cayley host is provided, the lib will return one single client directly.

  * If multiple cayley hosts are provided, the lib will return a clients array plus a default random client selection strategy which is named as `pickRandomly`, you can just use it as:

    ```javascript
    const cayleyClients = require('node-cayley')({
      servers: [
        {
          host: host_0,
          port: port_0
        },
        {
          host: host_1,
          port: port_1
        }
      ]
    });

    const client = cayleyClients.pickRandomly();

    const g = graph = client.g;

    client.delete(jsonObjArr).then((res) => {/* ... */}).catch((err) => {});
    ```

## HTTP APIs

**Depends on your `promisify` setting provide `callback style` or `bluebird Promise style` API.**

### write(data, callback)

* Description: write your JSON data into cayley as N-Quads data transparently.

* Arguments
  * data
    * Array of JSON objects.
    * You need to modify each of your object to add the below two fields:
      * primaryKey: `required`, which will be the **Subject** in the N-Quads data.
        * You need to define a way to generate the consistent primaryKey` for same data, the exactly same `primaryKey` is required when you try to delete this N-Quads entry.
      * label: `optional`, which is for organizing the graph into multiple subgraph.
  * callback
    * Has the below form:

      ```
      (err, resBody) => {
        // resBody: cayley server response body to this write.
      }
      ```

* Usage example:
  
  ```
  client.write([
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
    }, ...
  ], (err, resBody) => {
    if (err) {
      // Something went wrong...
    } else {
      // resBody: cayley server response body to this write.
    }
  });
  ```

### writeFile(pathOfNQuadsFile, callback)

* Description: write your N-Quads data file into cayley.

* Arguments
  * pathOfNQuadsFile: `string`, path to your N-Quads data file.
  * callback
    * Has the below form:

      ```
      (err, resBody) => {
        // ...
      }
      ```

* Usage example:

  ```
  client.writeFile(
    path.resolve(__dirname, './test/data/friend_circle_with_label.nq'),
    (err, resBody) => {
      // ...
    }
  );
  ```

### delete(data, callback)

* Description: delete the corresponding N-Quads data which are represented by this JSON `data` from cayley transparently.

* Arguments
  * data
    * Array of JSON objects.
    * You need to modify each of your object to add the below two fields:
      * primaryKey: `required`, which should be exactly same with the 'primaryKey' when you inserted this data before.
      * label: if you provided the 'label' when you inserted this data, then for deleting you also need to provide the exactly same value, or else you don't need.
  * callback
    * Has the below form:

      ```
      (err, resBody) => {
        // resBody: cayley server response body to this write.
      }
      ```

* Usage example:
  
  ```
  client.delete([
    primaryKey: '</user/shortid/23TplPdS>',
    label: 'companyA',

    userId: '23TplPdS',
    realName: 'XXX_L3',
    mobilePhone: {
      isVerified: false,
      alpha3CountryCode: '+65',
      mobilePhoneNoWithCountryCallingCode: '+6586720011'
    }, ...
  ], (err, resBody) => {
    // ...
  });
  ```

## Gremlin APIs

### Graph Object

* Alias: `g`

* This is the only special object in the environment, generates the query objects. Under the hood, they're simple objects that get compiled to a Go iterator tree when executed.

#### **graph.type(type)**

* Description: set type: either 'query' or 'shape', and then return a new `Graph` object, will decide the query finally goes to '/query/gremlin' or '/shape/gremlin'.

* Arguments
  * type: `string`, either 'query' or 'shape'.

* Usage example:

  ```
  g.type('query').V().All().then((resBody) => {
    // ...
  }).catch((err) => {
    // ...
  });
  ```

#### **graph.Vertex([nodeId],[nodeId]...)**

* Alias: `V`

* Description: starts a query path at the given vertex/vertices, no ids means 'all vertices', return `Query Object`.

* Arguments:
  * nodeId: `optional`, a string or list of strings representing the starting vertices.

* Usage example:

  ```
  // Or: g.Vertex('</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>')
  g.V('</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>').All().then((resBody) => {
    // ...
  }).catch((err) => {
    // ...
  });
  ```

#### **graph.Morphism()**

* Alias: `M`

* Description: creates a morphism path object. Unqueryable on it's own, defines one end of the path. Saving these to variables with is the common use case. See also: `path.Follow(morphism)`, `path.FollowR(morphism)`.

  ```
  var shorterPath = graph.M().Out('foo').Out('bar');
  ```

### Path Objects

Both `.Morphism()` and `.Vertex()` create path objects, which provide the following traversal methods.

Note that .Vertex() returns a query object, which is a subclass of path object.

<a href="https://github.com/cayleygraph/cayley/blob/master/docs/GremlinAPI.md" target="_blank">**For the following APIs which belong to the `Path Object` please refer to the upstream project cayley doc by following this link.**</a>:

* path.Out([predicatePath], [tags])
* path.In([predicatePath], [tags])
* path.Both([predicatePath], [tags])
* path.Is(node, [node..])
* path.Has(predicate, object)
* path.LabelContext([labelPath], [tags])
* path.Limit(limit)
* path.Skip(offset)
* path.InPredicates()
* path.OutPredicates()
* path.Tag(tag)
* path.Back(tag)
* path.Save(predicate, tag)
* path.Intersect(query)
* path.Union(query)
* path.Except(query)
* path.Follow(morphism)
* path.FollowR(morphism)

### Query Objects(finals)

**Subclass of `Path Object`**

**Depends on your `promisify` setting provide `callback style` or `bluebird Promise style` API.**

<a href="https://github.com/cayleygraph/cayley/blob/master/docs/GremlinAPI.md" target="_blank">**For the following APIs which belong to the `Query Object` please refer to the upstream project cayley doc by following this link.**</a>:

* query.All(callback)
* query.GetLimit(size, callback)
* query.ToArray(callback)
* query.ToValue(callback)
* query.TagArray(callback)
* query.TagValue(callback)
* query.ForEach(gremlinCallback, callback)
* query.ForEach(limit, gremlinCallback, callback)

**!!!Note:**
For above seven APIs which belong to `Query Object`, the parameter:

  * `callback` is meaning to provide a way for you receiving the error and response body when you choose the **callback style APIs**, just like demonstrate in above **Basic usages examples**:

    ```
    g.V().All((err, resBody) => {
      // ...
    })
    ```
    , which gremlin doesn't need it.
    If you set the `promisify` to `true`, then just:

    ```
    g.V().All().then((resBody) => {
      // ...
    }).catch((err) => {
      // ...
    });
    ```

  * `gremlinCallback` is a javascript function which is really needed by Gremlin/Cayley, try to understand the design here, the 'gremlinCallback' should satisfy the following conditions:
    1. No any reference to anything outside of this function, only pure js code.
      * Coz this function will be stringified and committed to cayley server, and then get executed there.
      * ES6 'arrow function' and other advanced features whether can be supported haven't been tested.
      
    2. Can use the APIs exposed by this lib belong to 'Path' object.

## Additional resources

Here are some resources which I read when I was trying to understand and learn some critical concepts related to graph database, hope can help you also, like:

  * What's graph database.
  * What's [cayley](https://github.com/cayleygraph/cayley).
  * How cayley actually store data.
  * What's N-Triples.
  * What's N-Quads.
  * What's RDF.
  * What's blank node.
  * How cayley deal with 'better be an object field', like the below 'mobilePhone':

    ```
    realName: 'XXX_L3',
    mobilePhone: {
      isVerified: false,
      alpha3CountryCode: '+65',
      mobilePhoneNoWithCountryCallingCode: '+6586720011'
    }

    </user/shortid/23TplPdS> <mobilePhone> _:l8 "companyA" .
    _:l8 <isVerified> "false" "companyA" .
    _:l8 <alpha3CountryCode> "+65" "companyA" .
    _:l8 <mobilePhoneNoWithCountryCallingCode> "+6586720011" "companyA" .
    ...
    ```
  * How to design your data schema for cayley.

  * Resource list
    * [Look at Cayley](http://blog.thefrontiergroup.com.au/2014/10/look-cayley/)
    * [Neo4j](http://info.neo4j.com/rs/neotechnology/images/Graph_Databases_2e_Neo4j.pdf)
    * 
    * [N-Triples](https://en.wikipedia.org/wiki/N-Triples)
    * [Blank Node](https://en.wikipedia.org/wiki/Blank_node)
    * 
    * [JSON-LD](http://json-ld.org/learn.html)
    * [JSON-LD](http://json-ld.org/spec/latest/json-ld-rdf/)
    * [JSON-LD](https://www.w3.org/TR/json-ld/)
    * [JSON-LD](https://www.w3.org/TR/json-ld-api/)
    * 
    * [!!! Beginners guide to schema design](https://discourse.cayley.io/t/beginners-guide-to-schema-design-working-thread/436)
    * [!!! Beginners guide to schema design](https://github.com/tamethecomplex/tutorial-documents/blob/master/cayley/BeginnersGraphDatabaseSchemaDesign.md)
    * [!!! RDF schema](https://www.w3.org/TR/rdf-schema/)
    * [Beginners guide to schema design](https://discourse.cayley.io/t/best-place-for-a-beginner-to-learn-about-schema-design/432)
    * 
    * [Update a quad](https://discourse.cayley.io/t/code-review-how-to-update-a-quad/336/7)
    * [RDF](https://discourse.cayley.io/t/how-to-improve-my-data-and-explain-the-topic-of-rdf/345/9)


