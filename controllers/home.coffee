base = require('./base')
https = require('https')
cheerio = require('cheerio')
_ = require('underscore')

BaseController = base.BaseController
models = require('../models')

class HomeController extends BaseController
    redirect: (req, res, next) ->
        res.redirect(req.query.v)

        if (req.user)
            models.Url.findOneAndUpdate({user:req.user, url:req.query.v}, {user:req.user, url:req.query.v, $inc: {click_count:1}, last_updated:Date.now()}, {upsert:true},
                (err, obj) ->
                    if (err)
                        next(err)
                    else
                        obj.click_count++
                    )

    index: (req, res, next) ->
        urls_data = {}
        q = models.Url.find({user:req.user}).sort('-last_updated').limit(50)
        q.execFind((err, urls) ->
            if err
                next(err)
            else
                _.each(urls, (url) ->
                    urls_data[url.url] = url
                )

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
                        $points = $subtext.find('span')
                        $points.remove()
                        href = $a.attr('href')
                        click_count = if urls_data[href] then urls_data[href].click_count else null
                        last_updated = if urls_data[href] then urls_data[href].last_updated else null
                        {title: $a.html(), href:href, subtext: $subtext.html(), points: parseInt($points.html()), comment_href: $($subtext.find('a')[1]).attr('href'), click_count:click_count, last_updated:last_updated}
                    )

                    articles = _.sortBy(articles, (article) ->
                        if article.title == 'More'
                            return Date.now()
                        else
                            return article.last_updated
                    )

                    res.render('index.html', {articles:articles})
                )

            https.request(options, callback).end()
        )

exports.controller = new HomeController()