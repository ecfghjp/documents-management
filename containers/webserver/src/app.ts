import express from 'express'
import path from 'path'
import axios from 'axios'
import { eventNames } from 'cluster';

const port = process.env.PORT;
const apiBase = process.env.API_BASE;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"



const app = express();
app.set('views',path.join(__dirname,'..','views'));
app.set('view engine','ejs');

app.get('/',async(req,res)=>{
    const documents = await getDocuments();
    res.render('index',{
        documents: documents
    });
});

const getDocuments = async() =>{
    const {data: results} = await axios.get(`${apiBase}getdocuments`);
    return results;
}

app.listen(port,()=>{
    console.log('Document management api started at port '+port);
})