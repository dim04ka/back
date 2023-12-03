const express = require('express');

const uuid = require('uuid');
const app = express();
const admin = require('firebase-admin');
const credentials = require('./key.json');
const cors = require('cors');

admin.initializeApp({
    credential: admin.credential.cert(credentials),
})

const db = admin.firestore();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: '*'
}));

app.get('/products', async (req, res) => {
    try {
        console.log('WORK')
        const productsRef = db.collection('products');
        const response = await productsRef.get();
        let responseArray = [];

        response.forEach((doc) => {
            responseArray.push(doc.data());
        })
        console.log('WORK send ', responseArray)
        res.send(responseArray);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post('/create', async (req, res) => {
    try {
        const uniqueId = uuid.v4();
        console.log('uniqueId', uniqueId);
        const userJson = {
            category: req.body.category,
            full_description: req.body.full_description,
            hide: req.body.hide,
            images: req.body.images,
            price: req.body.price,
            small_description: req.body.small_description,
            title: req.body.title,
            id: uniqueId
        }
        const response = await db.collection('products').doc(uniqueId).set(userJson);
        res.send(response);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get('/read/:id', async (req, res) => {
    try {
        console.log('req.params.id', req.params.id);
        const userRef = db.collection("products").doc(req.params.id);
        const response = await userRef.get();
        res.send(response.data());
    } catch (error) {
        res.send(error);
    }
});

app.post('/update', async (req, res) => {
    try {
        const id = req.body.id;
        console.log('id', id);
        const userRef = await db.collection("products").doc(id)
            .update({
                category: req.body.category,
                full_description: req.body.full_description,
                hide: req.body.hide,
                images: req.body.images,
                price: req.body.price,
                small_description: req.body.small_description,
                title: req.body.title,
            });
        res.send(userRef);
    } catch (error) {
        res.send(error);
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        console.log('req.params.id', req.params.id);
        const response = await db.collection("products").doc(req.params.id).delete();
        res.send(response);
    } catch(error) {
        res.send(error);
    }
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
