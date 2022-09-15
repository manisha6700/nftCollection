export default function handler(req, res) {

    // get the tokenId from the query params
    const tokenId = req.query.tokenId;


    const name = `Crypto Devs #${tokenId}`;
    const description = "CryptoDevs is an NFT Collection for Web3 Developers";
    const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`;

    res.status(200).json({
      name: name,
      description: description,
      image: image,
    });

    
  }