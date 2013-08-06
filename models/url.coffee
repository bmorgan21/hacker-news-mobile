mongoose = require('mongoose')
Schema = mongoose.Schema

schema = Schema({
    user: {type: Schema.Types.ObjectId,ref:'User'},
    url: String,
    click_count: {type:Number, default:0},
    ignore: {type:Boolean, default:false},
    last_updated: {type:Date}
    })

schema.index({user:1, url:1}, {unique:true})

exports.schema = schema