mongoose = require('mongoose')
models = require('../models')

exports.configure = (app) ->
    mongoose.connect('mongodb://localhost/hacker-news')
    models.init(mongoose)
