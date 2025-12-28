const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config('./.env')
const multer = require('multer')
const upload = multer()


const app = express()


const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.post('/create-transaction', upload.none(), async (req, res) => {

    try {
        const auth = 'Basic ' + Buffer.from(`${process.env.PUBLIC_KEY}:${process.env.SECRET_KEY}`).toString('base64');

        const { amount_cents } = req.body
        console.log(typeof amount_cents)


        var options = {
            method: 'POST',
            url: 'https://api.masterpagbr.com/v1/transactions',
            headers: {
                accept: 'application/json',
                authorization: auth,
                'content-type': 'application/json'
            },
            data: {
                amount: amount_cents,
                currency: 'BRL',
                paymentMethod: 'pix',
                pix: { expiresInDays: 1 },
                items: [{ title: 'cafe', unitPrice: amount_cents, quantity: 1, tangible: false }],
                customer: {
                    name: 'carlos chagas',
                    email: 'carloschagas@gmail.com',
                    document: { number: '09940665032', type: 'cpf' }
                }
            }
        };

        axios.request(options).then(function (response) {

            
            res.json({ transaction_id: response.data.id, qrcode_text: response.data.pix.qrcode, ok: true });
        }).catch(function (error) {
            console.error(error);
        });

    } catch (error) {
        console.log(error)
    }

})

app.get('/checkPayment/:id', async (req, res) => {
    const transactionId = req.params.id
    const auth = 'Basic ' + Buffer.from(`${process.env.PUBLIC_KEY}:${process.env.SECRET_KEY}`).toString('base64');
    try {
        const response = await axios.get(`https://api.masterpagbr.com/v1/transactions/${transactionId}`, {
            headers: {
                accept: 'application/json',
                authorization: auth
            }
        })

       
        const status = response.data.status
        

        if(status === "paid"){
            res.json({ status, ok: true })
        }
        

    } catch (error) {
        console.error('Erro ao buscar transação:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao buscar transação' });
    }
})

const port = 4000
app.listen(port, () => {
    console.log('server is running')
})
