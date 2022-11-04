const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()  


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsPurchased = await db.collection('todos').countDocuments({completed: true})
    const itemsInCart = await db.collection('todos').countDocuments({completed: false})

    let totalCost = 0;
    for (const item of todoItems) {
        totalCost += Number(item.itemCost)
    }

    response.render('index.ejs',{ 
        items: todoItems, inCart: itemsInCart, purchased: itemsPurchased, subtotal: totalCost.toFixed(2)
    })
    // response.render('index.ejs', { items: todoItems, purchased: itemsPurchased })
    
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false, itemCost: request.body.itemCost})
    .then(result => {
        console.log('Item Added to Cart')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

// app.post('/budget', (request, response) => {
//     db.collection('todos').insertOne({moneyLeft: request.body.budget})
//     .then(result => {
//         console.log('This is the remaining budget.')
//         response.redirect('/')
//     })
//     .catch(error => console.error(error))
// })

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Item Purchased')
        response.json('Item Purchased')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Item Not Purchased')
        response.json('Item Not Purchased')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Item Removed from Cart')
        response.json('Item Removed from Cart')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})