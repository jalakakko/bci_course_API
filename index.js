const express = require('express') 
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt') 
const passport = require('passport') 
const BasicStrategy = require('passport-http').BasicStrategy 

const { userSchema, itemSchema, userInfoSchema} = require('./schemas/validingSchemas') 

const app = express()
app.use(bodyParser.json())


const port = 3000
const saltRounds = 8  
let users = []
let posts = []

timeStampper = () => {
    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();
    return day + "-" + month + "-" + year
}
 
passport.use(new BasicStrategy( (username, password, done) => {
    const searchResult = users.find(user => {
        if(user.username === username) {
            if(bcrypt.compareSync(password, user.password)){
                return true
            } else { return false } 
        }
    }) 
    
    if(searchResult != undefined) {
        done(null, searchResult)
    } else {
        done(null, false)
    }
} 
)); 
 

app.get('/', (req, res) => {
    res.send("hello")
})
 
app.post('/signup', (req, res) => {  
    const { username, password } = req.body; 
    try { 
        //Check if username is taken
        for (const user of users) {
            if (user.username == req.body.username) { 
                throw "Username already taken"
            }
        }
        //validating username and password
        const valid = userSchema.validate(req.body)  
        if (valid.error) { 
            throw valid.error.message
        }

        const hashPassword = bcrypt.hashSync(password, saltRounds)
        const user = {
            id: uuidv4(), 
            username,
            password: hashPassword,
            contactInfo: {
                firstName: null,
                secondName: null,
                email: null,
                phoneNumber: null,
            },
            location: { 
                country: null,  
                city: null,
                address: null,
                postcode: null 
            }
        }  
        users.push(user) 
        res.status(201).send("New user created") 
    } 
    catch (err) {
        res.status(422).send(err)
    }
}) 

app.get('/users', (req, res) => { 
    res.status(200).send(users)
})

app.get('/posts', (req, res) => {
    res.status(200).send(posts)
})

app.post('/:userid/createPost', passport.authenticate('basic', { session: false}), (req, res) => {
    const { title, description, price, deliveryType, category } = req.body;

    try {
        const valid = itemSchema.validate(req.body)
        if (valid.error) { throw valid.error.message }
    }
    catch (err) {
        res.status(422).send(err) 
    } 
    
    let result = users.some(user => user.id == req.params.userid)
    if (result) {  
        for (const user of users) { 
            if (user.id == req.params.userid) {  
                let resultLocation = Object.values(user.location).some(x => (x !== null)); 
                let resultContactInfo = Object.values(user.contactInfo).some(x => (x !== null));  
                if (resultLocation == false || resultContactInfo == false) {
                    res.status(422).send("You need to have personal informations filled")
                    break
                }
                const newPost = {
                    id: uuidv4(),
                    postersId: user.id,
                    title,
                    description,
                    category,
                    location: user.location,
                    price,
                    postDate: timeStampper(),
                    deliveryType,
                    contactInfo: user.contactInfo
                }  

                posts.push(newPost)
                console.log(posts.length) 
                res.status(200).send("New post created")
                break 
            }
        }  
    } else { 
        res.status(422).send("User not found by that ID")
}})

app.patch('/users/:userid', passport.authenticate('basic', { session: false}), (req, res) => {
    const {firstName, secondName, email, phoneNumber, country, city, address, postcode} = req.body 
    try {
        const valid = userInfoSchema.validate(req.body)
        if (valid.error) { throw valid.error.message }
    }
    catch (err) {
        res.status(422).send(err)
    }

    let result = users.some(user => user.id == req.params.userid)
    if (result) {   
        for (const user of users) {
            if (user.id == req.params.userid) { 
                user.contactInfo.firstName = firstName;
                user.contactInfo.secondName = secondName;
                user.contactInfo.email = email;
                user.contactInfo.phoneNumber = phoneNumber;
                user.location.country = country;
                user.location.city = city;
                user.location.address = address;
                user.location.postcode = postcode; 
                res.status(200).send("Information modified")
            }
        }
    } else {  
        res.status(422).send("User not found by that ID") 
    }
})

app.patch('/:userid/posts/:itemid', passport.authenticate('basic', { session: false}), (req, res) => {
    const {title, description, category, price, deliveryType} = req.body

    try {
        const valid = itemSchema.validate(req.body)
        if (valid.error) { throw valid.error.message }
    }
    catch (err) {
        res.status(422).send(err) 
    } 

    let userResult = users.some(user => user.id == req.params.userid)
    let postResult = posts.some(post => post.id == req.params.itemid)
    if (userResult) {   
        if (postResult) {  
            for (const post of posts) { 
                if (post.postersId == req.params.userid) { 
                    if (post.id == req.params.itemid) { 
                        post.title = title
                        post.description = description
                        post.category = category
                        post.price = price
                        post.deliveryType = deliveryType
                        res.status(200).send("Information modified")
                    } 
                } 
            }
        } else { 
            res.status(422).send("Post not found by that ID")
        }
    } else { 
        res.status(422).send("User not found by that ID")
    }
})

app.delete('/:userid/posts/:itemid', passport.authenticate('basic', { session: false}), (req, res) => {   
    let userResult = users.some(user => user.id == req.params.userid)
    let postResult = posts.some(post => post.id == req.params.itemid)
    if (userResult) {   
        if (postResult) {  
            for(let i = 0; i < posts.length; i++) {  
                if (posts[i].id == req.params.itemid) {  
                    posts.splice(i, 1); 
                    res.status(200).send("Post deleted successfully")
                    break
                } 
            }
        } else { 
            res.status(422).send("Post not found by that ID")
        }
    } else { 
        res.status(422).send("User not found by that ID")
    }
}) 

//  users.some(user => user.id == req.params.userid
//app.getposts by date, category, location
app.get('/posts/:search', (req, res) => {
    let tempArr = [] 
        for (const post of posts) {
            if (post.postDate == req.params.search) {  
                tempArr.push(post) 
            } else if (post.category == req.params.search) {  
                tempArr.push(post) 
            } else if (post.location.country == req.params.search) { 
                tempArr.push(post)
            } else if (post.location.city == req.params.search) { 
                tempArr.push(post)
            } else if (post.location.address == req.params.search) { 
                tempArr.push(post)
            } else if (post.location.postcode == req.params.search) { 
                tempArr.push(post)
            }
        }
        res.status(200).send(tempArr)
})



let serverInstance = null
module.exports = {
    start: function() {
        serverInstance = app.listen(port, () => {
            console.log(`listening at http://localhost:${port}`)
        })
    },
    close: function() {
        serverInstance.close()
    },
    users, posts
}