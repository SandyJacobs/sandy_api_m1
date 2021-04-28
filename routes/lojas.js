const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const config = require('../config/config');
const loja = require('../models/loja');


const createUserToken = (userId) => {
    return jwt.sign({ 
        id: userId }, 
        config.jwtPass,
        { expiresIn: config.jwtExpires });
};
//http://localhost:3000/users/auth -> post


router.post('/auth', (req,res) => {
    const { login, password } = req.body; 
    if (!login || !password)
        return res.send({ error: 'Dados inválidos! '});

    Users.findOne({ login }, (err, data) => {
        if (err)
            return res.send({ error: 'Erro ao buscar usuário!' });
        if (!data)
            return res.send({ error: 'Usuário não encontrado! '});

        bcrypt.compare(password,data.password, (err,same) => {

            if (!same)
                return res.send({ error: 'Erro na autenticação!'});
            data.password = undefined;
            return res.send({ data, token: createUserToken(data.id) });
        });
    }).select('+password');
});


//https://localhost:3000/users/ ->get
router.get('/', async (req,res) => {
    try {
        const lojas = await loja.find({}); 
        return res.send(lojas);
    }
    catch (err) {
        return res.status(500).send({ error: 'Erro na busca das lojas!' }); 
    }
});


//http://localhost:3000/users/create -> post
router.post('/create', async (req,res) => { 
    const { nome, site , tipo, cidade, estado } = req.body;
    if (!nome || !site ) 
        return res.send({ error: 'Verifique se todos os campos obrigatórios foram informados! '});
        try {
            if (await loja.findOne({ nome,site }))
                return res.send({ error: 'Loja já cadastrada! '});
            const lojas = await loja.create(req.body);
            return res.status(201).send({ lojas });
        }
        catch (err) {
            return res.send({ error: `Erro ao gravar loja: ${err}`})
        }
    });

//http://localhost:3000/users/update/'idDoUsuario'

router.put('/update/:id', auth, async (req,res) => {
    const { nome, site , tipo, cidade, estado } = req.body;
    if (!nome || !site) 
        return res.send({ error: 'Verifique se todos os campos obrigatórios foram informados! '});
        try {
            if (await loja.findOne({ site }))
                return res.send({ error: 'Site já cadastrado! '});
            const lojas = await loja.findByIdAndUpdate(req.params.id, req.body);
            const lojasChanged = await loja.findById(req.params.id);
            return res.status(201).send({ lojasChanged });
        }
        catch (err) {
            return res.send({ error: `Erro ao atualizar loja: ${err}`})
        }   
});

module.exports = router;