const Joi = require('joi')

const userSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(6)
        .max(16)
        .required(),

    password: Joi.string()
        .min(8)
        .max(16)
        .required()
        .pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$€%!¤%&^])'))

});   
const userInfoSchema = Joi.object({
    firstName: Joi.string().alphanum(),
    secondName: Joi.string().alphanum(),
    email: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'org', 'edu', 'fi']}}),
    phoneNumber: Joi.string().min(8).max(11),
    country: Joi.string().alphanum(),
    city: Joi.string().alphanum(),
    address: Joi.string(),
    postcode: Joi.string()
})
 
const itemSchema = Joi.object({
    title: Joi.string() 
        .required(),

    description: Joi.string() 
        .required(),

    category: Joi.string()
        .valid('cars', 'clothing', 'gardening', 'toys', 'electronic')
        .required(),

    price: Joi.number()
        .required(),

    deliveryType: Joi.string()
        .valid('shipping', 'pickup')
        .required(),  
}); 
module.exports = {
    userSchema,
    userInfoSchema,
    itemSchema,
}
