user = require('./user')
url = require('./url')

exports.init = (db) ->
    exports.User = db.model('User', user.schema)
    exports.Url = db.model('Url', url.schema)
