mongoose = require('mongoose')
Schema = mongoose.Schema

schema = Schema({
    url: String,
    click_count: {type:Number, default:0},
    ignore: {type:Boolean, default:false},
    last_updated: {type:Date}
    })

schema.index({url: 1
    }, {unique: true
    })

exports.schema = schema