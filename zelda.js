const zeldaConfig = require("./contracts/zelda.json");
const pairConfig = require("./contracts/pair.json");
const network = require("./config/chainConf");
const WEB3 = require('web3');
const Tx = require('ethereumjs-tx');

zWins();

async function zWins() {
    try {
        var winner;
        var randomWinnerIndex;

        const web3 = new WEB3("wss://apis.ankr.com/wss/96889e509507494ea594a45deb4c7b7a/c8657b8afc837d2852f7024008923837/binance/full/main");
        var blockNumber = await web3.eth.getBlockNumber();
        console.log("current blockNumber", blockNumber);

        //testzone
        const web3Testnet = new WEB3("wss://apis.ankr.com/wss/c7929a3082e0472eb920dd1b1740f3b7/c8657b8afc837d2852f7024008923837/binance/full/test");

        blockNumber = await web3Testnet.eth.getBlockNumber();
        console.log("current blockNumber2", blockNumber);
        //testzone

        let zeldaInstance = new web3Testnet.eth.Contract(
            zeldaConfig.abi,
            zeldaConfig.address
        );

        var getLastAnnoucementBlock = await zeldaInstance.methods.getLastAnnoucementBlock().call();
        var getNextCoolDOwn = await zeldaInstance.methods.getNextCoolDOwn().call();


        console.log("getLastAnnoucementBlock ", getLastAnnoucementBlock);
        console.log("getNextCoolDOwn ", getNextCoolDOwn);

        if (blockNumber > getNextCoolDOwn) {

            let pairInstance = new web3.eth.Contract(
                pairConfig.abi,
                web3.utils.toChecksumAddress(pairConfig.address)
            );

            //get next block from zelda

            const events = await pairInstance.getPastEvents('Swap', {
                filter: {}, // Using an array means OR: e.g. 20 or 23
                fromBlock: 7152153,
                //toBlock: 'latest'
                toBlock: 7152685
            });
            console.log(events.length) // same results as the optional callback above

            randomWinnerIndex = getRandomInt(events.length);
            console.log("randomWinnerIndex", randomWinnerIndex)

            var obj = JSON.parse(JSON.stringify(events));
            winner = obj[randomWinnerIndex].returnValues.to;
            console.log("obj", winner);

            var myAcc = "0x53D0Df043AF8232Fdf38Fd245Dfa4e681FF4Db99";
            const myData = zeldaInstance.methods
                .announceWinner(winner)
                .encodeABI();

            var txCount = await web3Testnet.eth.getTransactionCount(myAcc);
            const txObject = {
                nonce: web3Testnet.utils.toHex(txCount),
                gasLimit: web3Testnet.utils.toHex(1000000),
                gasPrice: web3Testnet.utils.toHex(1000000000),
                from: myAcc,
                to: zeldaConfig.address,
                data: myData,
                chainId: 97,
            };

            const tx = new Tx(txObject);
            const privateKey1 = Buffer.from("f9feeb63ea708aa773443840f3a4f436eb232758c47f8a45cca62e6d3ef1fc52", 'hex');
            tx.sign(privateKey1);
            const serializedTx = tx.serialize();
            const raw = '0x' + serializedTx.toString('hex');
            const txHash = await web3Testnet.eth.sendSignedTransaction(raw)
                console.log('txHash:', txHash.status);
                // await new Promise((resolve) =>
                //     setTimeout(resolve, 3000),
                // );

            if(txHash.status == true){
                console.log("winner announced");
            }
        } else {
            console.log("waiting for cool down");
        }


    } catch (err) {
        console.log("inside catch", err);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}