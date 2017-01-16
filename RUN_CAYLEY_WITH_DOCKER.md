# Run Cayley with docker

* Run with MongoDB

  1. `mkdir cayley_config && vim cayley_config/cayley.cfg`, and then write in the following content:

    ```
    {
      "database": "mongo",
      "db_path": "10.0.1.6:27017",
      "listen_host": "0.0.0.0",
      "listen_port": "64210",
      "read_only": false,
      "load_size": 10000,
      "timeout": 30,
      "db_options": {
        "database_name": "cayley"
      },
      "replication_options": {
        "ignore_missing": false,
        "ignore_duplicate": false
      }
    }
    ```

  2. Then at the same level as directory `cayley_config` run:

    ```
    docker run -v $PWD/cayley_config/:/data -p 64210:64210 -d quay.io/cayleygraph/cayley
    ```
    Then you have cayley server running at `localhost:64210`, and data will be actually stored in MongoDB which is specified by `db_path`.


