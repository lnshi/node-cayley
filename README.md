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

## Visualized graph

> **Note:**

> All the code examples in this README guidebook are based on the test data here: [friend_circle_with_label.nq](./test/data/friend_circle_with_label.nq), which can be visualized as the below graph in cayley:

<img src="https://github.com/lnshi/node-cayley/blob/master/test/data/friend_circle_with_label.nq_0_visualized.png" />

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

g.V('</user/shortid/46Juzcyx>').Out('<follows>', 'predicate').All().then((res) => {
  // res will be: {result:[{id:'</user/shortid/23TplPdS>',predicate:'<follows>'}]}
}).catch((err) => {
  // Error ...
});

// 'type' default to 'query', you can change to 'shape' by calling g.type('shape')
g.type('shape').V().All((err, res) => {});

const popularQuery = g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);
g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).All().then((res) => {
  // res will be: {result:[{id:'xxx.l30@xxx.com'},{id:'_:l32'}]}
}).catch((err) => {
  // Error ...
});
```

## Configuration

  * Options

    * promisify: `boolean`, default to true, set true to use bluebird style APIs, false to use callback style APIs.

    * logLevel: `integer`, set log level, this lib use logger winston and npm log levels(winston.config.npm.levels).

    * secure: `boolean`, set whether your cayley server use TLS.

    * certFile: `string`, path of your TLS cert file, if above 'secure' is set to true, this must be provided.

    * keyFile: `string`, path of your TLS key file, if above 'secure' is set to true, this must be provided.

    * caFile: `string`, path of your TLS root CA file, if above 'secure' is set to true, this must be provided.

    * servers: `Array of multiple cayley hosts object`, options here will override the top level options.

  * Two configuration examples:

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

`promisify: true`, default, the lib will provide all APIs in bluebird Promise style, or else all APIs will be provided in callback style, for both styles usages examples can be found in the lib [test folder](./test).

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

### graph object

* grpah
  > const g = client.graph;

* Alias: `g`
  > const g = client.g;

* This is the only special object in the environment, generates the query objects. Under the hood, they're simple objects that get compiled to a Go iterator tree when executed.

### graph.type(type)

* Description: set type: either 'query' or 'shape', and then return a new `graph` object, will decide the query finally goes to `/query/gizmo` or '/shape/gizmo'.

* **type**: either `query` or `shape`.

* Usage examples:

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

### graph.Vertex(nodeId || [nodeId, ...])

* Alias: `V`

* Description: starts a query path at the given vertex/vertices, no ids means 'all vertices', return `Query Object`.

* **nodeId || [nodeId, ...]**: `optional`, a single string `nodeId` or an array of string `nodeId` represents the starting vertices.

* Usage examples:

  ```javascript
  g.V('</user/shortid/23TplPdS>').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.type('shape').V(['</user/shortid/23TplPdS>', '</user/shortid/46Juzcyx>']).All().then((res) => {
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
        // res will be: {result:[{id:'xxx.l30@xxx.com'},{id:'_:l32'}]}
      }).catch((err) => {
        // Error ...
      });
    ```

  * But because of this query is highly required, we need this piece of query in a lot of other functionalities, we don't want to and shouldn't repeat the code again and again, then we can use `graph.Morphism()` to store this path set into one variable, then at the places we need it, we just reuse it by using the `path.Follow(morphism)` and `path.FollowR(morphism)` APIs, like below:

    ```javascript
    // Then we can reuse this path set later.
    const popularQuery = g.M().Out('<follows>').In('<follows>').Has('<gender>', 'F').Out(['<email>', '<mobilePhone>']);

    g.V('</user/shortid/46Juzcyx>').Follow(popularQuery).All().then((res) => {
      // res will be exactly same with above query.
      // res will be: {result:[{id:'xxx.l30@xxx.com'},{id:'_:l32'}]}
    }).catch((err) => {
      // Error ...
    });
    ```

## Gizmo APIs → Path Object

> Both `.Morphism()/.M()` and `.Vertex()/.V()` create `Path` object, which provides the following traversal methods.

> Note: that `.Vertex()/.V()` returns a `Query` object, which is a subclass of `Path` object.

### path.Out([predicatePath], [tags])

* Description: `Out()` is the work-a-day way to get between nodes, in the forward direction. Starting with the nodes in path on the subject, follow the quads with predicates defined by **predicatePath** to their objects.

* **predicatePath** `optional`, one of:

  * null or undefined: All predicates pointing out from this node.
  * a string: The predicate name to follow out from this node.
  * an array of strings: The predicates to follow out from this node.
  * a query path object: The target of which is a set of predicates to follow.

* **tags** `optional`, one of:

  * null or undefined: No tags.
  * a string: A single tag to add the predicate used to the output set.
  * an array of strings: Multiple tags to use as keys to save the predicate used to the output set.

* Usage examples:

  ```javascript
  g.V('</user/shortid/46Juzcyx>').Out('<follows>', 'predicate').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>',predicate:'<follows>'}]}
  }).catch((err) => {
    // Error ...
  });

  // If we pass in one 'predicatePath', but two tags, what the result will look like?
  // As you can see the below result, that indicates: 
  //   every 'predicatePath' just own all the 'tags' you passed in.
  g.V('</user/shortid/46Juzcyx>').Out('<follows>', ['predicate', 'ifExtraTag?']).All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>','ifExtraTag?':'<follows>',predicate:'<follows>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.V('</user/shortid/46Juzcyx>').Out(['<follows>', '<userId>'], ['predicate', 'extraTag']).All().then((res) => {
    // res will be: {result:[{extraTag:'<follows>',id:'</user/shortid/23TplPdS>',predicate:'<follows>'},{extraTag:'<userId>',id:'46Juzcyx',predicate:'<userId>'}]}
  }).catch((err) => {
    // Error ...
  });

  // Haven't found out one very useful use case here, I mean by passing in a query.
  g.V('</user/shortid/46Juzcyx>').Out(
    g.V(['<userId>', '<userSetId>']),
    'predicate'
  ).All().then((res) => {
    // res will be: {result:[{id:'46Juzcyx',predicate:'<userId>'},{id:'XXX_L14',predicate:'<userSetId>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.In([predicatePath], [tags])

* Description: same as `Out()`, but in the other direction. Starting with the nodes in path on the object, follow the quads with predicates defined by **predicatePath** to their subjects.

* **predicatePath** `optional`, one of:

  * null or undefined: All predicates pointing into this node.
  * a string: The predicate name to follow into this node.
  * an array of strings: The predicates to follow into this node.
  * a query path object: The target of which is a set of predicates to follow.

* **tags** `optional`, one of:

  * null or undefined: No tags.
  * a string: A single tag to add the predicate used to the output set.
  * an array of strings: Multiple tags to use as keys to save the predicate used to the output set.

* Usage examples:

  ```javascript
  g.V('false').In('<isEmailVerified>', 'predicate').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/46Juzcyx>',predicate:'<isEmailVerified>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.V('false').In(['<isEmailVerified>', '<isVerified>'], ['predicate', 'extraTag']).All().then((res) => {
    // res will be: {result:[{extraTag:'<isEmailVerified>',id:'</user/shortid/46Juzcyx>',predicate:'<isEmailVerified>'},{extraTag:'<isVerified>',id:'_:l8',predicate:'<isVerified>'},{extraTag:'<isVerified>',id:'_:l20',predicate:'<isVerified>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.V('false').In(
    g.V(['<isEmailVerified>', '<isVerified>']),
    'predicate'
  ).All().then((res) => {
    // res will be: {result:[{extraTag:'<isEmailVerified>',id:'</user/shortid/46Juzcyx>',predicate:'<isEmailVerified>'},{extraTag:'<isVerified>',id:'_:l8',predicate:'<isVerified>'},{extraTag:'<isVerified>',id:'_:l20',predicate:'<isVerified>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.Both([predicatePath], [tags])

> Note: less efficient, for the moment, as it's implemented with an Or, but useful where necessary.

* Description: same as `In()` and `Out()`, but follow the predicate in either direction(into and out) from the node.

* **predicatePath** `optional`, one of:

  * null or undefined: All predicates pointing both into and out from this node.
  * a string: The predicate name to follow both into and out from this node.
  * an array of strings: The predicates to follow both into and out from this node.
  * a query path object: The target of which is a set of predicates to follow.

* **tags** `optional`, one of:

  * null or undefined: No tags.
  * a string: A single tag to add the predicate used to the output set.
  * an array of strings: Multiple tags to use as keys to save the predicate used to the output set.

* Usage examples:

  ```javascript
  g.V('</user/shortid/46Juzcyx>').Both('<follows>', 'predicate').All().then((res) => {
    // It seems 'tags' doesn't work properly for 'Both'.
    //   see here: https://github.com/cayleygraph/cayley/issues/532
    // res will be: {result:[{id:'</user/shortid/23TplPdS>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.Is(node || [node, ...])

* Description: filter all paths to ones, which at this point, are on the given node.

* **node || [node, ...]**: `required`, a single string represents a node or an array of string represents a node array.

* Usage examples:

  ```javascript
  g.V('</user/shortid/23TplPdS>').In('<follows>').Is('</user/shortid/46Juzcyx>').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/46Juzcyx>'}]}
  }).catch((err) => {
    // Error ...
  });

  g.V('</user/shortid/23TplPdS>').In('<follows>')
    .Is(['</user/shortid/46Juzcyx>', '</user/shortid/hwX6aOr7>', '</user/fake/value>'])
    .All().then((res) => {
      // res will be: {result:[{id:'</user/shortid/46Juzcyx>'},{id:'</user/shortid/hwX6aOr7>'}]}
    }).catch((err) => {
      // Error ...
    });
  ```

### path.Has(predicatePath, node)

* Description: 

  * Filter all paths which are, at this point, on the subject for the given predicate and object, but do not follow the path, merely filter the possible paths.
  * Usually useful for starting with all nodes, or limiting to a subset depending on some predicate/value pair.

* **predicatePath**: `required`, a string predicate path.

* **node**: `required`, a string represents a node.

* Usage example:

  ```javascript
  g.V().Has('<gender>', 'F').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/hwX6aOr7>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.LabelContext([labelPath], [tags])

> Note: the subgraph label of the N-Quads item should always be set to the same value with the the node which it is pointing out from.

* Description: sets (or removes) the subgraph context to consider in the succedent traversals. Affects all `In()`, `Out()`, and `Both()` calls that follow it.

* **labelPath** `optional`, one of:

  * null or undefined: In future traversals, consider all edges, regardless of subgraph.
  * a string: The name of the subgraph to restrict traversals to.
  * an array of strings: A set of subgraphs to restrict traversals to.
  * a query path object: The target of which is a set of subgraphs.

* **tags** `optional`, one of:

  * null or undefined: No tags.
  * a string: A single tag to add the last traversed label to the output set.
  * an array of strings: Multiple tags to use as keys to save the label used to the output set.

* Usage examples:

  ```javascript
  g.V('</user/shortid/BJg4Kj2HOe>').LabelContext('companyA', 'label').In('<follows>').All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>',label:'companyA'},{id:'</user/shortid/46Juzcyx>',label:'companyA'}]}
  }).catch((err) => {
    // Error ...
  });

  // Then restrict the traversals only to 'companyB' subgraph.
  g.V('</user/shortid/BJg4Kj2HOe>').LabelContext('companyB', 'label').In('<follows>').All().then((res) => {
    // res will be: {result:null}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.Limit(limit)

* Description: limits a number of nodes for current path.

* **limit**: `required` `Integer`, a number of nodes to limit results to.

* Usage examples:

  ```javascript
  g.V('M').In('<gender>').Limit(1).All().then((res) => {
    // res will be: {result:[{id:'</user/shortid/23TplPdS>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.Skip(offset)

* Description: skips a number of nodes for current path.

* **offset**: `required` `Integer`, a number of nodes to skip.

* Usage examples:

  ```javascript
  // Skip 0.
  g.V().Has('<alpha3CountryCode>', 'SGP').Skip(0).All().then((res) => {
    // res will be: {result:[{id:'_:l8'},{id:'_:l20'},{id:'_:l32'}]}
  }).catch((err) => {
    // Error ...
  });

  // Skip 2.
  g.V().Has('<alpha3CountryCode>', 'SGP').Skip(2).All().then((res) => {
    // res will be: {result:[{id:'_:l32'}]}
  }).catch((err) => {
    // Error ...
  });
  ```

### path.InPredicates()

* Description: get the list of predicates that are pointing into a node.

* Usage examples:

  ```javascript
  g.V('</user/shortid/BJg4Kj2HOe>').InPredicates().All().then((res) => {
    // res will be: { result: [ { id: '<follows>' } ] }
  }).catch((err) => {
    // Error ...
  });

  g.V('true').InPredicates().All().then((res) => {
    // res will be: { result: [ { id: '<isEmailVerified>' }, { id: '<isVerified>' } ] }
  }).catch((err) => {
    // Error ...
  });
  ```

### path.OutPredicates()

* Description: get the list of predicates that are pointing out from a node.

* Usage example:

  ```javascript
  g.V('</user/shortid/BJg4Kj2HOe>').OutPredicates().All().then((res) => {
    // res will be: {result:[{id:'<userId>'},{id:'<realName>'},{id:'<email>'},{id:'<follows>'}]}
  }).catch((err) => {
    // Error ...
  });
  ```


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


