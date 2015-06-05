var P = require('bluebird'),
    bunyan = require('bunyan'),
    log = bunyan.createLogger({name: "ocdsImport"}),
    argv = require('minimist')(process.argv.slice(2)),
    fs = P.promisifyAll(require('fs')),
    elasticsearch = require('elasticsearch'),

    // get cli arguments - file, lint, index respectively
    file = argv.f,
    lint = argv.l || argv.lint,
    esIndex = argv.i,

    // connect to localhost elasticsearch
    esClient = new elasticsearch.Client()


// async fs call because of bluebird wrapper
function readFileAsync() {
    log.info(file)
    return fs.readFileAsync(file)
        .then(function (release) {
            return JSON.parse(release)
        })
}


/* Dispatch an item for import/indexing in elasticsearch
   If the json is consistent, then the mapping will be automatically generated
   If it fails: outside of this tool (on the cli) grab the mapping, 
   edit every field to a string and reupload mapping
*/
function indexItem(item) {
    var id = item.id.replace(/\//g, '_')

    return esClient.index({
        index: esIndex,
        type: 'releases',
        body: item,
        id: id
    })
        .then(function () {
            log.info('indexed ', id)
        })
}


// index the release by using document ids as keys for indexItem promise
function indexRelease() {
    var releaseKeys = []

    return readFileAsync()
        .then(function (release) {
            releaseKeys = Object.keys(release.releases)
            return release
        })
        .then(function (release) {
            return P.all(releaseKeys.map(function (key) {
                return indexItem(release.releases[key])
            }))
        })

}


// release the hounds!
(function () {
    if ( lint === true) {
        readFileAsync()
            .done(function () {
                log.info("looks like valid json")
            })
    } else if ( esIndex === undefined ) {
            log.fatal('No elasticsearch index was specified.')
            log.fatal('Please specify an index to use with the -i flag.')
            process.exit(1)
    } else {
        indexRelease()
            .then(function () {
                esClient.close()
            })
            .done(function () {
                log.info("All done")
            })
    }
}())
