const express = require('express');
const router = express.Router();
const Users = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const config = require('../config/config');


const createUserToken = (userId) => {
    return jwt.sign({ 
        id: userId }, 
        config.jwtPass,
        { expiresIn: config.jwtExpires });
};
//http://localhost:3000/users/auth -> post
// criando o endpoint para autenticar na API
router.post('/auth', (req,res) => {
    const { login, password } = req.body; 
    if (!login || !password)
        return res.send({ error: 'Dados inválidos! '});
    // se foram informados
    //verificando se existe o e-mail
    Users.findOne({ login }, (err, data) => {
        if (err)
            return res.send({ error: 'Erro ao buscar usuário!' });
        if (!data)
            return res.send({ error: 'Usuário não encontrado! '});
        // caso não ocorra nenhuma das situações acima
        // comparar a senha informada com a senha salva
        bcrypt.compare(password,data.password, (err,same) => {
            // testando se as senhas não são iguais
            if (!same)
                return res.send({ error: 'Erro na autenticação!'});
            // se as senhas forem iguais
            // impedindo o retorno da senha
            data.password = undefined;
            return res.send({ data, token: createUserToken(data.id) });
        });
    }).select('+password');
});

// criando o endpoint para salvar usuário
//http://localhost:3000/users/create -> post
router.post('/create', async (req,res) => { 
    const { nome,sobrenome,nascimento,login,password,dicaSenha,cidade,estado } = req.body;
    //para testar: console.log(`${name} - ${username} - ${phone} - ${email} - ${password}`);
    // testando se todos os campos obrigatórios foram informados
    if (!nome || !sobrenome || !nascimento || !login || !password) 
        return res.send({ error: 'Verifique se todos os campos obrigatórios foram informados! '});
    try {
        // verificando se o usuário/email já está cadastrado
        if (await Users.findOne({ login }))
            return res.send({ error: 'Usuário já cadastrado! '});
        // se o usuário ainda nao for cadastrado
        const user = await Users.create(req.body);
        // impedindo o retorno da senha
        user.password = undefined;
        return res.status(201).send({ user, token: createUserToken(user.id) });
    }
    catch (err) {
        return res.send({ error: `Erro ao gravar o usuário: ${err}`})
    }
});

//http://localhost:3000/users/update/'idDoUsuario'
// criando o endpoint para alterar usuário
router.put('/update/:id', auth, async (req,res) => {
    const { nome,sobrenome,nascimento,login,password,dicaSenha,cidade,estado } = req.body;
    if (!nome || !sobrenome || !nascimento || !login || !password) 
        return res.send({ error: 'Verifique se todos os campos obrigatórios foram informados! '});
    try {
        // verificando se o usuário/email já está cadastrado
        if (await Users.findOne({ login }))
            return res.send({ error: 'Usuário já cadastrado! '});
        // se o usuário ainda nao for cadastrado
        const user = await Users.findByIdAndUpdate(req.params.id, req.body); //req.params.id: pega o id fornecido na URL
        // realizando uma nova busca após a alteração para obter o usuário com as alterações
        const userChanged = await Users.findById(req.params.id);
        // impedindo o retorno da senha
        userChanged.password = undefined;
        return res.status(201).send({ userChanged }); //, token: createUserToken(userChanged.id) 
    }
    catch (err) {
        return res.send({ error: `Erro ao atualizar o usuário: ${err}`})
    }     
});
//http://localhost:3000/users/delete/'idDoUsuario'
// criando o endpoint para apagar usuário
router.delete('/delete/:id', auth, async (req,res) => {
    try {
        await Users.findByIdAndDelete(req.params.id);
        return res.send({ error: 'Usuário removido com sucesso!' });
    }
    catch (err) {
        return res.send({ error: 'Erro ao remover usuário!' });
    }     
});

// exportando o módulo
module.exports = router;