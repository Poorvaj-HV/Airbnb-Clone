// Server side validation using Joi

const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null)
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({            // review is the key in the form which holds the object type data and here review is an object and it is required
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});