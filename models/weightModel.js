const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')// imported the mongoose-paginate

// Define the weight schema
const weightSchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        required: true,
        ref: 'User',
      },
});
weightSchema.plugin(mongoosePaginate);// use the plugin
// Create the model for Weight
const Weight = mongoose.model('Weight', weightSchema);
module.exports = Weight;
