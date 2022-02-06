export default function handler(req, res) {
  // get the tokenId from the query params
  const tokenId = req.query.tokenId;
  // As all the images are uploaded on github, we can extract the images from github directly.
  const image_url =
    'https://raw.githubusercontent.com/gilangadam/nft-collection/main/my-app/public/halftone-eth/';
  // To make our collection compatible with Opensea, we need to follow some Metadata standards
  // More info can be found here: https://docs.opensea.io/docs/metadata-standards
  res.status(200).json({
    name: 'Halftone ETH #' + tokenId,
    description:
      'Halftone ETH is a multi-variant halftone version of Ethereum icon',
    image: image_url + tokenId + '.svg',
  });
}
