import express from 'express';

import {
        deleteInvoice, invoices, newInvoive, searchCustomer,updateInvoice, 
        getUser, login, register,update,message,sendPdf

    } from '../controller/Controller.js';

const Routes = express.Router();

Routes.post('/login',login);
Routes.post('/register',register);
Routes.post('/create', newInvoive);
Routes.post('/invoices', invoices);
Routes.delete('/delete/:id', deleteInvoice);
Routes.post('/user',getUser);
Routes.post('/search', searchCustomer); // this one for searching the customer by their name ,email etc.. 
Routes.put('/update',update); // this one for update the company or user profile 
Routes.put('/update/:id', updateInvoice); // this one for updating invoice but currently not working
Routes.post('/message', message);
Routes.post('/sendPdf',sendPdf) // share on whatshap

export default Routes;
