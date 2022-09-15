import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";
export default function Home(){

    const [walletConnected, setWalletConnected] = useState(false);
    const [presaleStarted, setPresaleStarted] = useState(false);
    const [presaleEnded, setPresaleEnded] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

    const web3ModalRef = useRef();
    
    const getProviderOrSigner = async(needSigner = false) =>{
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        //connect to goerli network
        const {chainId} = await web3Provider.getNetwork();
        if(chainId !== 5){
            window.alert("Change the network to Goerli")
            throw new Error("Change network to Goerli")
        }

        if(needSigner){
            const signer = web3Provider.getSigner();
            return signer;
        }

        return web3Provider;
    }

    const connectWallet = async() =>{
        try{
            await getProviderOrSigner();
            setWalletConnected(true);
        }catch(err){
            console.error(err);
        }
    }

    const getOwner = async () =>{
        try{
            const provider = await getProviderOrSigner();
            const nftContract =  new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                provider
            )

            const _owner = await nftContract.owner();

            const signer = await getProviderOrSigner(true);

            const address = await signer.getAddress();
            if(address.toLowerCase() === _owner.toLowerCase){
                setIsOwner(true);
            }

        }catch(err){
            console.error(err);
        }
    }

    const checkIfPresaleStarted = async() =>{
        try{
            const provider = await getProviderOrSigner();

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                provider
                );

            const _presaleStarted = await nftContract.presaleStarted();
            if(!_presaleStarted){
                await getOwner();
            }
            setPresaleStarted(_presaleStarted);
            return _presaleStarted;
        }catch(err){
            console.error(err);
            return false;
        }
    }
    
    const checkIfPresaleEnded = async () =>{
        try{
            const provider = await getProviderOrSigner();

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                provider
                );

            const _presaleEnded = await nftContract.presaleEnded();
            
            const hasEnded = _presaleEnded.lt(Math.floor(Date.now()/1000));
            setPresaleEnded(hasEnded)
            return hasEnded;
        }catch(err){
            console.error(err);
            return false;
        }
    }

    const startPresale = async() =>{
        try{
            const signer = await getProviderOrSigner(true);

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                signer
            )

            const transac = await nftContract.startPresale();
            setLoading(true);
            await transac.wait();
            setLoading(false);

            await checkIfPresaleStarted();
        }catch(err){
            console.error(err)
        }
    }

    const getTokenIdsMinted = async () =>{
        try{
            const provider = await getProviderOrSigner();

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                provider
                );

            const _tokenId = await nftContract.tokenIds();

            setTokenIdsMinted(_tokenId.toString());

        }catch(err){
            console.error(err)
        }
    }

    const presaleMint = async () =>{
        try{
            const signer = await getProviderOrSigner(true);

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                signer
            )

            const transac = await nftContract.presaleMint({
                value:utils.parseEther("0.0005")
            });
            setLoading(true);
            await transac.wait();
            setLoading(false);

            window.alert("Yayyy!!! You have successfully minted a Crypto Dev!!")
        }catch(err){
            console.error(err)
        }
    }

    const publicMint = async () =>{
        try{
            const signer = await getProviderOrSigner(true);

            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                abi,
                signer
            )

            const transac = await nftContract.mint({
                value:utils.parseEther("0.001")
            });
            setLoading(true);
            await transac.wait();
            setLoading(false);

            window.alert("Yayyy!!! You have successfully minted a Crypto Dev!!")
        }catch(err){
            console.error(err)
        }
    }

    // const pauseContract = async () =>{
    //     try{
    //         const signer = await getProviderOrSigner(true);

    //         const nftContract = new Contract(
    //             NFT_CONTRACT_ADDRESS,
    //             abi,
    //             signer
    //         )

    //         const transac = nftContract.setPaused(true);
    //         setLoading(true);
    //         await transac.wait();
    //         setLoading(false);

    //     }catch(err){
    //         console.error(err)
    //     }
    // }

    useEffect(()=>{
        if(!walletConnected){
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions:{},
                disableInjectedProvider:false,
            })
            connectWallet();

            const _presaleStarted = checkIfPresaleStarted();
            if(_presaleStarted){
                checkIfPresaleEnded();
            }

            getTokenIdsMinted();

            //interval to check if presale ended
            const presaleEndedInterval = setInterval(async () => {
                const _presaleStarted = await checkIfPresaleStarted();
                if(_presaleStarted){
                    const _presaleEnded = await checkIfPresaleEnded();
                    if(_presaleEnded){
                        clearInterval(presaleEndedInterval);
                    }
                }
            }, 5* 1000);

            //interval to get no of token ids minted
            setInterval(async ()=>{
                await getTokenIdsMinted();
            }, 5 * 1000) 
        }
    },[walletConnected])

    const renderButton = () => {
        if(!walletConnected){
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Connect Wallet!!
                </button>
            )
        }

        if(loading){
            return (
                <button disabled className={styles.button}>
                    Loading...
                </button>
            )
        }

        if(isOwner && !presaleStarted){
            return (
                <button onClick={startPresale} className={styles.button}>
                    Start Presale
                </button>
            )
        }

        if(!presaleStarted){
            return (
                <p className={styles.description}>Presale hasn&apos;t Started</p>
            )
        }

        if(presaleStarted && !presaleEnded){
            return(
                <div>
                  <div className={styles.description}>
                    Presale has started!!! If your address is whitelisted, Mint a
                    Crypto Dev 🥳
                  </div>
                  <button className={styles.button} onClick={presaleMint}>
                    Presale Mint 🚀
                  </button>
                </div>
            )
        }

        if(presaleStarted && presaleEnded){
            return(
                <button onClick={publicMint} className={styles.button}>
                    Public Mint 🚀
                </button>
            )
        }

    }

    return (
        <div>
            <Head>
                <title>Crypto Devs</title>
                <meta name="description" content="Whitelist-dApp"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <div>

            </div>
            <div>
                <h1 className={styles.title}>
                    Welcome to Crypto Devs!!
                </h1>
                <div className={styles.description}>
                    It&apos;s an NFT collection for developers in Crypto
                </div>
                <div className={styles.description}>
                    {tokenIdsMinted}/20 have been minted
                </div>
                {renderButton()}
                {/* {isOwner &&
                    <button onClick={pauseContract} className={styles.button}>
                        Pause Contract
                    </button>
                } */}
            </div>
            <div>
                <img className={styles.image} src="./cryptodevs/0.svg" alt="Crypto Devs" />
            </div>

            <footer className={styles.footer}>
                Made with &#10084; by Crypto Devs
            </footer>
        </div>
    )
}