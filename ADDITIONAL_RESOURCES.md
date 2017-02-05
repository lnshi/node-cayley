# Additional Resources

Here are some questions I asked myself and resources which I read when I was trying to understand and learn graph database, hope can help you also:

* What's graph database.
* What's cayley.
* How cayley actually store data.
* What's N-Triples.
* What's N-Quads.
* What's RDF.
* What's blank node.
* How cayley deal with 'an object field', like the below 'mobilePhone':

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
  * [Beginners guide to schema design 0](https://discourse.cayley.io/t/beginners-guide-to-schema-design-working-thread/436)
  * [Beginners guide to schema design 1](https://github.com/tamethecomplex/tutorial-documents/blob/master/cayley/BeginnersGraphDatabaseSchemaDesign.md)
  * [Beginners guide to schema design 2](https://discourse.cayley.io/t/best-place-for-a-beginner-to-learn-about-schema-design/432)
  * [RDF schema](https://www.w3.org/TR/rdf-schema/)
  * 
  * [Update a quad](https://discourse.cayley.io/t/code-review-how-to-update-a-quad/336/7)
  * [RDF](https://discourse.cayley.io/t/how-to-improve-my-data-and-explain-the-topic-of-rdf/345/9)


