const got = require('got');
const HTMLParser = require('node-html-parser');
const prompt = require('prompt-sync')();
const { Webhook, MessageBuilder } = require('discord-webhook-node');

console.log('hello world');

//https://www.amazon.com/Flagship-HP-Chromebook-Anti-Glare-Processor/dp/B08PDTLK1Q, https://www.amazon.com/Canon-Full-frame-Interchangeable-lightweight-3380C132/dp/B086TTTZR5?th=1;

const hook = new Webhook("YOUR WEBHOOK URL");
const embed = new MessageBuilder()
    .setTitle('Amazon Monitor')
    .setColor('#90ee90')
    .setTimestamp();

async function Monitor(productLink){
    const myHeaders = {
        'connection': 'keep-alive',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
        'sec-ch-ua-mobile': '?0',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'downlink': 10,
        'ect': '4g',
        'rtt': 50,
    }
    const response = await got(productLink, {
        headers: myHeaders,
    });
    if (response && response.statusCode === 200){
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('#availability');
        if (availabilityDiv) {
            let productImage = root.querySelector('#landingImage').getAttribute('src');
            let productName = productLink.substring(productLink.indexOf('com/') + 4, productLink.indexOf('/dp'));
            let stockText = availabilityDiv.childNodes[1].innerText.toLowerCase();
            if (stockText == 'out of stock') {
                console.log(productName, ' : OUT OF STOCK');
            } else {
                embed.setThumbnail(productImage);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'IN STOCK', false);
                hook.send(embed);
                console.log(productName, ' : IN STOCK');
            }
        }
    }

    await new Promise(r => setTimeout(r, 8000));
    Monitor(productLink);
    return false;
}

async function Run(){
    const productLink = prompt('Enter links to monitor: ');

    const productLinksArr = productLink.split(',');

    for(let i = 0; i < productLinksArr.length; i++) {
        productLinksArr[i] = productLinksArr[i].trim();
    }

    let monitors = []; //array of promises

    productLinksArr.forEach(link => {
        const p = new Promise((resolve, reject) => {
            resolve(Monitor(link));
        }).catch(err => console.log(err));

        monitors.push(p);
    });

    console.log('New monitoring ' + productLinksArr.length + ' items');
    await Promise.allSettled(monitors);
}
Run();