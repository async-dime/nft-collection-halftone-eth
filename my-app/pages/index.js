import Head from 'next/head';
import Web3Modal from 'web3modal';
import styles from '../styles/Home.module.css';
import ProgressBar from '@badrap/bar-of-progress';
import Toast from '../components/Toast';
import { useEffect, useRef, useState } from 'react';
import { Contract, providers, utils } from 'ethers';
import { abi, NFT_CONTRACT_ADDRESS } from '../constants';
import CountDownTimer from '../components/CountDownTimer';

const BarOfProgress = new ProgressBar({
  size: 4,
  color: '#d38312',
  className: `${styles.progressBar}`,
  delay: 150,
});

export default function Home() {
  const [list, setList] = useState([]); // list of toasts
  // walletConnected keep track of whether the user's wallet is connected or nah
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or nah
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale has ended or nah
  const [presaleEnded, setPresaleEnded] = useState(false);
  // timestamp of presale end
  const [presaleEndedTimestamp, setPresaleEndedTimestamp] = useState(0);
  // loading is set true when we are waiting for the transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState('0');
  // create a reference to the Web3 modal that used for connecting to MetaMask which persists as long as page open
  const web3ModalRef = useRef();
  // button disable

  // const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
  // const customTime = 4 * 60 * 60 * 1000 + 10 * 60 * 1000;
  // const NOW_IN_MS = new Date().getTime();
  // const mockTimestamp = NOW_IN_MS + customTime;
  // const mockTimestamp = NOW_IN_MS + THREE_DAYS_IN_MS;

  const TWITTER_HANDLE = 'async_dime';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  let toastProperties = null;

  const showToast = (type, text) => {
    const id = Date.now();
    const desc = text.toString();

    switch (type) {
      case 'success':
        toastProperties = {
          id,
          title: 'Success',
          description: desc,
          backgroundColor: '#5cb85c',
          icon: 'checkIcon',
        };
        break;
      case 'error':
        toastProperties = {
          id,
          title: 'Error',
          description: desc,
          backgroundColor: '#d9534f',
          icon: 'errorIcon',
        };
        break;
      default:
        setList([]);
    }
    setList([...list, toastProperties]);
  };

  const notStarted = async () => {
    try {
      showToast(
        'error',
        `The presale still not open, please wait for the developer`
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * presaleMint: Mint an NFT during the presale
   */
  const presaleMint = async () => {
    try {
      // need a `Signer` since this is a write transactions
      const signer = await getProviderOrSigner(true);
      // create a new instance of the Contract with Signer, that allow update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the presaleMint from the contract, only whitelisted address is allowed to mint
      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one halftone-eth which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther('0.01'),
      });
      BarOfProgress.start(15000);
      // set loading to true so we can show a loading status
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      BarOfProgress.finish();
      // set loading to false, transaction is done
      setLoading(false);
      showToast('success', 'Successfully minted Halftone-ETH NFT!');
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        `Minting Halftone-ETH NFT unsuccessful: ${err.message}`
      );
    }
  };

  /**
   * publicMint: Mint an NFT after the presale
   */
  const publicMint = async () => {
    try {
      // need a `Signer` since this is a write transactions
      const signer = await getProviderOrSigner(true);
      // create a new instance of the Contract with Signer, that allow update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the Halftone Eth
      const tx = await whitelistContract.mint({
        // value signifies the cost of one halftone eth which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther('0.01'),
      });
      BarOfProgress.start(15000);
      // set loading to true so we can show a loading status
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      BarOfProgress.finish();
      // set loading to false, transaction is done
      setLoading(false);
      showToast('success', 'Successfully minted Halftone-ETH NFT!');
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        `Minting Halftone-ETH NFT unsuccessful: ${err.message}`
      );
    }
  };

  /**
   * startPresale: starts the presale for the NFT collection
   */
  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the startPresale from the contract
      const tx = await whitelistContract.startPresale();
      BarOfProgress.start(15000);
      // set loading to true so we can show a loading status
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      BarOfProgress.finish();
      // set loading to false, transaction is done
      setLoading(false);
      // set the presale started status to be true
      await checkIfPresaleStarted();
      showToast(
        'success',
        'Successfully started the presale of Halftone-ETH NFT!'
      );
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        `Presale Halftone-ETH NFT unsuccessful: ${err.message}`
      );
    }
  };

  /**
   * checkIfPresaleStarted: checks if the presale has started
   * by querying the `presaleStarted` variable in contract
   */
  const checkIfPresaleStarted = async () => {
    try {
      // get the provider from web3modal (metamask)
      // we only read the state from the blockchain so no need `Signer`
      const provider = await getProviderOrSigner();
      // connect to the Contract using Provider,
      // so we only have read-only access to the contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * checkIfPresaleEnded: checks if the presale has ended
   * by querying the `presaleEnded` variable in contract
   */
  const checkIfPresaleEnded = async () => {
    try {
      // get the provider from web3modal (metamask)
      // we only read the state from the blockchain so no need `Signer`
      const provider = await getProviderOrSigner();
      // connect to the Contract using Provider,
      // so we only have read-only access to the contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleEnded from the contract
      const _presaleEnded = await nftContract.presaleEnded();
      setPresaleEndedTimestamp(_presaleEnded * 1000);
      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * getOwner: gets the owner of the contract
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // need a `Signer`, to extract the address of currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // get the address of the currently connected MetaMask account
      const address = await signer.getAddress();
      // check if the address of the currently connected MetaMask account is the owner
      const isOwner = address.toLowerCase() === _owner.toLowerCase();
      setIsOwner(isOwner);
    } catch (err) {
      console.error(err.message);
      showToast('error', err.message);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      // _tokenIds is a `Big Number`, so we need to convert it to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
      showToast('error', err.message);
    }
  };

  /**
   * Returns a `Provider` or `Signer` object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` object is used to read data from the blockchain, while a `Signer` object is used
   * to write data to the blockchain
   *
   * @param {*} needSigner - true if you need the signer, default is false
   */
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      // connect to MetaMask
      // since we store `web3modal` as a reference, we need to access the `current` value
      // to access the underlying object
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // if the user isn't connected to MetaMask account, we throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        showToast('error', 'Change the network to Rinkeby');
        throw new Error('Please connect to the Rinkeby testnet');
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      setWalletConnected(true);
      return web3Provider;
    } catch (err) {
      console.error(err);
      showToast('error', 'Please install MetaMask!');
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        showToast('error', 'Make sure you have MetaMask!');
        return;
      } else {
        showToast('success', `We have the ethereum object: ${ethereum}`);

        const accounts = await ethereum.request({ method: 'eth_accounts' }); // Check if we're authorized to access the user's wallet

        if (accounts.length !== 0) {
          const account = accounts[0];
          showToast('success', `Found a wallet address: ${account}.`);

          // if wallet isn't connected, create a new instance of Web3Modal and connect the MetaMask wallet
          if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
              network: 'rinkeby',
              providerOptions: {},
              disableInjectedProvider: false,
            });
            connectWallet();

            // check if presale has started and ended
            const _presaleStarted = checkIfPresaleStarted();
            if (_presaleStarted) {
              checkIfPresaleEnded();
            }

            getTokenIdsMinted();

            // set an interval which gets called every 5 seconds to check if presale has ended
            const presaleEndedInterval = setInterval(async function () {
              const _presaleStarted = await checkIfPresaleStarted();
              if (_presaleStarted) {
                const _presaleEnded = await checkIfPresaleEnded();
                if (_presaleEnded) {
                  clearInterval(presaleEndedInterval);
                }
              }
            }, 5000);
          }
        } else {
          showToast('error', 'Please connect your MetaMask wallet.');
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * connectWallet: Connect to the MetaMask wallet
   */
  const connectWallet = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        // get the provider from web3modal (metamask)
        // for the first-time user, it prompts user to connect their wallet
        await getProviderOrSigner();
      } else {
        showToast('error', 'Please install MetaMask!');
        return;
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.message);
    }
  };

  /**
   * useEffects are used to react to changes in state of the website
   * The array at the end of function call represents what state changes will trigger this effect
   * In this case, whenever the value of `walletConnected` changes - this effect will be called
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [walletConnected]);

  /**
   * renderButton: returns a button based on the DApp state
   */
  const renderButton = () => {
    // if wallet isn't connected, return a button which allows them to connect their wallet
    if (walletConnected) {
      // if we are currently waiting for something, return a loading button
      if (loading) return <button className={styles.button}>Loading...</button>;

      // if connected user is NOT the owner, and presale hasn't started yet, display a presale status
      if (!isOwner && !presaleStarted) {
        return (
          <button onClick={notStarted} className={styles.button}>
            Wait for the presale to open
          </button>
        );
      }

      // if connected user is the owner, and presale hasn't started yet, allow them to start a presale
      if (isOwner && !presaleStarted) {
        return (
          <button onClick={startPresale} className={styles.button}>
            Start presale
          </button>
        );
      }

      // if presale has started, but not ended, allow for minting during the presale period
      if (presaleStarted && !presaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has started!!! If your address is whitelisted, Mint a
              Halftone-ETH 🚀 Whitelist yourself first
              <a
                href="https://halftone-ethereum-whitelist.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <span className={styles.linkText}> here</span>
              </a>
            </div>
            <button onClick={presaleMint} className={styles.button}>
              Presale Mint 🪙
            </button>
          </div>
        );
      }

      // if presale started and has ended, public minting can start
      if (presaleStarted && presaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has ended, but you still can do public minting!
            </div>
            <button onClick={publicMint} className={styles.button}>
              Public Mint 🪙
            </button>
          </div>
        );
      }
    } else if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Halftone ETH</title>
        <meta name="description" content="Halftone-Eth-Dapp" />
        <link rel="icon" href="/halftone-ethx50.ico" />
      </Head>
      {/* <CountDownTimer targetDate={mockTimestamp} /> */}
      <CountDownTimer targetDate={presaleEndedTimestamp} />
      <div className={styles.main}>
        <Toast toastList={list} />
        <div>
          <h1 className={styles.header}>Halftone-Ethereum</h1>
          <div className={styles.description}>
            This is a NFT collection of multi-variant halftone version of
            Ethereum icon.
          </div>
          <div className={styles.description}>
            <span className={styles.mintedTokenIds}>
              <b>{tokenIdsMinted} / 20 </b>
            </span>
            have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./halftone-eth/00.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        <div>
          <img
            alt="Twitter Logo"
            className={styles.twitterLogo}
            src="./twitter.svg"
          />
          {'  '}
          <a
            className={styles.footerText}
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <b>{`built by @${TWITTER_HANDLE}`}</b>
          </a>
        </div>
      </footer>
    </div>
  );
}
