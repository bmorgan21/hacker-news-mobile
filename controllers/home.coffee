base = require('./base')
https = require('https')
cheerio = require('cheerio')

BaseController = base.BaseController

class HomeController extends BaseController
    index: (req, res, next) ->
        options = {
            host: 'news.ycombinator.com',
            path: if req.params.page then "/news#{req.params.page}" else (if req.query.fnid then "/x?fnid=#{req.query.fnid}" else '')
        }

        callback = (response) ->
            str = ''

            response.on('data', (chunk) ->
                str += chunk
            )

            response.on('end', () ->
                $ = cheerio.load(str)
                $body = $('body')
                $titles = $body.find('td.title a')
                articles = $titles.map((idx, el) ->
                    $tr = $(el).closest('tr')

                    $a = $tr.find('td.title a')
                    $subtext = $tr.next('tr').find('td.subtext')
                    {title: $a.html(), href:$a.attr('href'), subtext: $subtext.text(), comment_href: $($subtext.find('a')[1]).attr('href')}
                )

                res.render('index.html', {articles:articles})
            )

        https.request(options, callback).end()

exports.controller = new HomeController()