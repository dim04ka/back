const express = require('express');

const uuid = require('uuid');
const app = express();
const admin = require('firebase-admin');
const credentials = require('./key.json');
const cors = require('cors');

admin.initializeApp({
    credential: admin.credential.cert(credentials),
    storageBucket: "gs://mara-b5982.appspot.com"
})

const db = admin.firestore();
const multer = require('multer');
// import {getDownloadURL, getStorage} from 'firebase-admin/storage';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + file.originalname)
    }
})
var upload = multer({ storage: storage });


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: '*'
}));


// app.post
// ('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         // how to save file and receive link on it?
//         var bucket = admin.storage().bucket();
//
//         bucket.upload(req.file)
//
//
//         console.log(req.file, req)
//         res.status(200).send('No file uploaded.');
//         return;
//     }
//
// // You can perform additional operations with the uploaded image here.
//     res.status(200).send('Image uploaded and saved successfully.');
// });
// const upload = multer({ dest: 'uploads/' });
var bucket = admin.storage().bucket();

// app.post('/upload', upload.single('files'), (req, res) => {
//     try {
//         const files = req.files;
//
//         if (!files || files.length === 0) {
//             console.log('files', files)
//             return res.status(400).send('No files were uploaded.');
//         }
//
//         // Process the uploaded files
//         const fileNames = files.map((file) => file.filename);
//
//         res.status(200).json({ message: 'Files uploaded successfully', fileNames });
//     } catch (error) {
//         console.error('Error uploading files:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
// app.post("/upload", async (req, res, next) => {
//
//     console.log('req.body', req);
//     // const result = await bucket.upload('1.png');
//     // console.log('result :', result);
//     // return res.send(result);
// });


// const storage = multer.memoryStorage(); // You can also specify a destination folder

app.post('/upload', upload.single('x'), async (req, res) => {
    try {
        const uploadedFile = req.file
        const [file] = await bucket.upload(uploadedFile.path);

        const img_url = 'https://firebasestorage.googleapis.com/v0/b/mara-b5982.appspot.com/o/'
            + encodeURIComponent(file.name)
            + '?alt=media&token='
            + file.id;

        res.status(200).send({img_url});
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).send('Internal Server Error');
    }
});
// https://firebasestorage.googleapis.com/v0/b/mara-b5982.appspot.com/o/f9266925-071b-48d3-bc12-f3a3d9c3c0baIMG_0350%201.png?alt=media&token=a0f619fb-4eb9-418c-9d03-4e29f2a4c982
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
            sizes: req.body.sizes,
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
                size: req.body.sizes,
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
