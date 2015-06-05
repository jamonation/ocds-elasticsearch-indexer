OCDS Elasticsearch importer
===========================

Sample invocation:

```
node ocds.js -f tpsgc-pwgsc_ocds_EF-FY-15-16.json -i ocds_buyandsell
```

This will parse and then index the tpsgc-pwgsc... file into an elasticsearch index given with the -i flag called 'ocds_buyandsell'

A few things:
-------------

1. this tool assumes an elasticsearch running on localhost

2. the document type is called 'releases' in elasticsearch

3. to capture nicer log output, pipe the invocation to bunyan:

    ```
    node ocds.js -f tpsgc-pwgsc_ocds_EF-FY-15-16.json -i ocds | ./node_modules/.bin/bunyan
    ```
4. linting is just a dumb JSON.parse call - use jsonlint if you need more functionality to check your files
