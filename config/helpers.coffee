humanize = require('humanize')
markdown = require( "markdown" ).markdown
querystring = require('querystring')

exports.JSON = {
    stringify: (obj) ->
        result = JSON.stringify(obj)
        if ('string' == typeof result)
            result = result.replace(/'/g, "&#39")
        return result
    }
exports.humanize = humanize
exports.markdown = markdown
exports.querystring = querystring
