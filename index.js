const dotenv = require('dotenv')
const axios = require('axios')
const web3 = require('web3')

dotenv.config()

async function getBlockNumber() {
    var web3Client = await new web3(process.env.ALCHEMY_API);
    var blockNumber = await web3Client.eth.getBlockNumber();
    return blockNumber;
}

async function getProposals() {
    let blockNumber = await getBlockNumber();
    // Get block from a day ago
    let queryBlock = blockNumber - 6500;

    const response = await axios.get('https://proposal-api.vercel.app/api/proposal', {
        params: {
            blockNumber: queryBlock
        }
    });
    let proposals = response.data.proposals;
    message = ""
    proposals.forEach((p) => {
        message += (":" + p.platform + ": <" + p.link + "|*Proposal " + p.id + "*> _" + p.state + "_: " + p.title + "\n\n");
    })
    if (message == "") {
        message = "No new proposals!"
    }
    return message;
}

async function postToSlack() {
    let message = await getProposals();
    console.log(message);
    const response = await axios.post(process.env.SLACK_INCOMING_WEBHOOK, {
            text: message
    });
    console.log(response.status);
}

let response = postToSlack()
