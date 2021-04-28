const env = process.env.NODE_ENV || 'dev';

const config = () => {
    switch (env) {
        //dev desenvolvimento
        case 'dev' :
            return {
                dbString : 'mongodb+srv://sandy:crepusculo10@cluster0.3wxc6.mongodb.net/deliverydb?retryWrites=true&w=majority',
                jwtPass : 'starwarsemelhorquestartrek',
                jwtExpires : '1d'
            }
            //hml homologação
        case 'hml' :
            return {
                dbString : 'mongodb+srv://sandy:crepusculo10@cluster0.3wxc6.mongodb.net/deliverydb?retryWrites=true&w=majority',
                jwtPass : 'starwarsemelhorquestartrek',
                jwtExpires : '1d'
            }
            //prod produção
        case 'prod' :
            return {
                dbString : 'mongodb+srv://sandy:crepusculo10@cluster0.3wxc6.mongodb.net/deliverydb?retryWrites=true&w=majority',
                jwtPass : 'starwarsemelhorquestartrek',
                jwtExpires : '1d'
            }
    }
};

console.log(`Iniciando a API em ambiente ${env.toUpperCase()}`);

module.exports = config();