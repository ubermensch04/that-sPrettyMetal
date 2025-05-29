const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pioneeringAlbumsSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    artist:{
        type: String,
        required: true,
        trim: true
    },
    }, 
    {_id: false});

const subgenreSchema = new Schema({
    name:{
        type: String,
        required: [true,'Subgenre name is required.'],
        trim: true
    },
    description:{
        type: String,
        default: "",
        trim: true
    },
    keyBands: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                // Check if it's an array
                return Array.isArray(v);
            },
            message: props => `keyBands must be an array of strings`
        }
    },
    influencerBands: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return Array.isArray(v);
            },
            message: props => `influencerBands must be an array of strings`
        }
    },
    pioneeringAlbums: {
        type: [pioneeringAlbumsSchema],
        default: []
    }
},
{
    timestamps: true
});

const Subgenre = mongoose.model('Subgenre', subgenreSchema);
module.exports = Subgenre;