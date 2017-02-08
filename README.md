# node-cayley [![Build Status](https://travis-ci.org/lnshi/node-cayley.svg?branch=master)](https://travis-ci.org/lnshi/node-cayley)

This is a Node.js client for open-source graph database [cayley](https://github.com/cayleygraph/cayley).

## Feature list

* ES6 based.
* TLS supported.
* Multiple cayley hosts supported.
* Default random client selection strategy.
* Bluebird Promise style and callback style APIs.
* Transparent bidirectional JSON <-> N-Quads data formatting handling.
* Travis CI.
* Fully covered mocha + chai test cases.
* Clearly designed entry-level N-Quads data: [friend_circle_with_label.nq](./test/data/friend_circle_with_label.nq) for getting you in.

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
  // Error ...
});

// Callback style.
client.delete(jsonObjArr, (err, res) => {});

g.V().All().then((res) => {
  // Your data in JSON.
}).catch((err) => {
  // Error ...
});

// 'type' default to 'query', you can change to 'shape' by calling g.type('shape')
g.type('shape').V().All((err, res) => {});
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
    const client = require('node-cayley')('localhost:64210', {
      promisify: true
    });

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

`promisify: true`, default, the lib will provide all APIs in bluebird Promise style, or else all APIs will be provided in callback style, for both styles usage examples can be found in the lib [test folder](./test).

### write(data, callback)

* Description: write your JSON data into cayley as N-Quads data transparently.

* **data**: Array of JSON objects, you need to add the below two extra fields to each object:

  * **primaryKey**: `required`, which will be the **Subject** in the N-Quads data.

    > Note: you need to define a way to generate consistent `primaryKey` for same data, the exactly same `primaryKey`(Subject) is required when in the future you try to delete this N-Quads entry.

  * **label**: `optional`, which is for cayley subgraph organizing.

* **callback(err, res)**

* Usage example:
  
  ```javascript
  client.write([
    {
      primaryKey: '</user/shortid/23TplPdS>',
      label: 'companyA',

      userId: '23TplPdS',
      realName: 'XXX_L3'
    }
  ], (err, res) => {
    if (err) {
      // Something went wrong...
    } else {
      // resBody: cayley server response body to this write.
    }
  });
  ```

### read(callback)

* Description: read N-Quads data from cayley, the lib will transparently convert the data to JSON.
  > Note: response not in JSON yet, will add the functionality soon.

* **callback(err, res)**

* Usage example:

  ```javascript
  client.read().then((res) => {
    // Your data in JSON.
  }).catch((err) => {
    // Error ...
  });
  ```

### writeFile(pathOfNQuadsFile, callback)

* Description: write your N-Quads data file into cayley.

* **pathOfNQuadsFile**: path of your N-Quads data file.

* **callback(err, res)**

* Usage example:

  ```javascript
  client.writeFile(path.resolve(__dirname, './test/data/test_purpose.nq')).then((res) => {
    // Successfully wrote to cayley.
  }).catch((err) => {
    // Error ...
  });
  ```

### delete(data, callback)

* Description: delete the corresponding N-Quads data which are represented by this JSON data from cayley transparently.

* **data**: Array of JSON objects, for each object you need to provide the values for the below two extra fields:

  * **primaryKey**: `required`, which should be exactly same with the 'primaryKey' when you inserted this data.

  * **label**: if you provided the `label` when you inserted this data, then for deleting you must also need to provide the exactly same value.

* **callback(err, res)**

* Usage example:
  
  ```javascript
  client.delete([
    {
      primaryKey: '</user/shortid/23TplPdS>',
      label: 'companyA',

      userId: '23TplPdS',
      realName: 'XXX_L3'
    }
  ]).then((res) => {
    // Successfully deleted from cayley.
  }).catch((err) => {
    // Error ...
  });
  ```

## Gizmo APIs → graph object

> All the below code examples will be based on the test data here: [friend_circle_with_label.nq](./test/data/friend_circle_with_label.nq), which can be visualized as graph in cayley as below:

<img src="https://github.com/lnshi/node-cayley/blob/master/test/data/friend_circle_with_label.nq_0_visualized.png" />

### graph object

* grpah
  > const g = client.graph;

* Alias: `g`
  > const g = client.g;

* This is the only special object in the environment, generates the query objects. Under the hood, they're simple objects that get compiled to a Go iterator tree when executed.

### graph.type(type)

* Description: set type: either 'query' or 'shape', and then return a new `graph` object, will decide the query finally goes to `/query/gizmo` or '/shape/gizmo'.

* **type**: either `query` or `shape`.

* Usage example:

  ```javascript
  // Default to 'query'.
  g.V().All().then((res) => {
    // Your data in JSON.
  }).catch((err) => {
    // Error ...
  });

  // Change to 'shape'
  g.type('shape').V().All().then((res) => {
    // Your data in JSON.
  }).catch((err) => {
    // Error ...
  });
  ```

### graph.Vertex([nodeId], [nodeId], ...)

* Alias: `V`

* Description: starts a query path at the given vertex/vertices, no ids means 'all vertices', return `Query Object`.

* **nodeId**: `optional`, a string or a list of strings represent the starting vertices.

* Usage example:

  ```javascript
  g.V('</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>'},{id:'</user/shortid/46Juzcyx>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.type('shape').V('</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>'},{id:'</user/shortid/46Juzcyx>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### graph.Morphism()

* Alias: `M`

* Description: creates a morphism `Path` object, unqueryable on it's own, defines one path set in the graph, saving it into a variable then in the future reuse it by using the below `path.Follow(morphism)` and `path.FollowR(morphism)` APIs is the common use case.

* Lets make it more clear by going through the below examples:

  * Lets say we have a query which is getting the `email` and `mobilePhone` of those female followers who follows the one I am following, then we can simply fulfill this requirement by using the below code:

    ```javascript
    g.V('</user/shortid/46Juzcyx>')
      .Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>'])
      .All().then((res) => {
        // res will be:
      }).catch((err) => {
        // Error ...
      });
    ```

  * But because of this query is highly required, we need this piece of query in a lot of other functionalities, we don't want to and shouldn't repeat the code again and again, then we can use `graph.Morphism()` to store this path set into one variable, then at the places we need it we just reuse it by using the `path.Follow(morphism)` and `path.FollowR(morphism)` APIs, like below:

    ```javascript
    // Then we can reuse this path set later.
    const popularQuery = g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);

    g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).All().then((res) => {
      // res will be exactly same with above query.
      // res will be:
    }).catch((err) => {
      // Error ...
    });
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

## Additional Resources

<a href="https://github.com/lnshi/node-cayley/blob/master/ADDITIONAL_RESOURCES.md" target="_blank">See here.</a>


