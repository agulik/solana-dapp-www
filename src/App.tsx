import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Commitment,
  ConfirmOptions,
} from "@solana/web3.js";
import { Idl, Program, Provider, web3 } from "@project-serum/anchor";
import Loader from "react-loader-spinner";

import kp from "./keypair.json";
import idl from "./idl.json";

const Wrapper = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  height: 100%;
  background-color: #5741d9;
  color: white;
  h2 {
    margin-bottom: 12px;
  }
`;

const Button = styled.button`
  margin-top: 24px;
  color: #161616;
  background: rgb(20, 241, 149);
  width: 100%;
  min-width: 44px;
  max-width: 190px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  display: block;
  cursor: pointer;
  position: relative;
  transition: 100ms linear;
  border: 0;
  font-weight: 600;
  &[disabled] {
    opacity: 0.4;
    cursor: no-drop;
  }
`;

const InputImagesWrapper = styled.div`
  width: 100%;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px auto 0;
  max-width: 600px;
  width: 100%;
  @media (max-width: 600px) {
    margin: 0 12px;
    flex-direction: column;
    width: initial;
  }
`;

const StyledInput = styled.input`
  max-width: 400px;
  width: 100%;
  height: 46px;
  background-color: #efefef;
  border: 1px solid white;
  border-radius: 10px;
  font-size: 16px;
  color: #1f2039;
  margin-right: 8px;
  padding-left: 16px;
  &::placeholder {
    font-size: 16px;
    color: 1f2039;
  }
  &:focus {
    padding-left: 16px;
    font-size: 16px;
    border: 1px solid white;
  }
  @media (max-width: 600px) {
    margin-bottom: 24px;
    margin-right: 0;
    max-width: initial;
    width: calc(100% - 16px);
  }
`;

const SubmitButton = styled(Button)`
  margin-top: initial;
  height: 46px;
  min-width: initial;
  @media (max-width: 600px) {
    max-width: 100%;
  }
`;

const InitializationButton = styled(Button)`
  margin-top: initial;
  min-width: initial;
`;

const ImagesWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 24px;
`;

const ImageWrapper = styled.div`
  height: 300px;
  max-width: 350px;
  width: 100%;
  border-radius: 24px;
  padding: 8px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

declare global {
  interface Window {
    solana?: any;
  }
}

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl("devnet");

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed",
};

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [imageList, setImageList] = useState<{ imageLink: string }[] | null>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getProvider = () => {
    const connection = new Connection(
      network,
      opts.preflightCommitment as Commitment
    );
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment as ConfirmOptions
    );
    return provider;
  };

  const getImageList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setImageList(account.imageList);
    } catch (error) {
      console.log("Error in getImages: ", error);
      setImageList(null);
    }
  };

  const createImageAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getImageList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const sendImage = async () => {
    console.log("Image link:", inputValue);
    setLoading(true);
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, programID, provider);

      await program.rpc.addImage(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Image successfully sent to program", inputValue);

      await getImageList();
      setInputValue("");
      setLoading(false);
    } catch (error) {
      console.log("Error sending Image:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    window.addEventListener("load", async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      getImageList();
    }
  }, [walletAddress]);

  return (
    <Wrapper>
      <h2>Architecture Wall</h2>
      <p>Architecture inspo in the metaverse ✨</p>
      {!walletAddress ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : imageList === null ? (
        <InitializationButton onClick={createImageAccount}>
          Do One-Time Initialization For Image Program Account
        </InitializationButton>
      ) : (
        <InputImagesWrapper>
          {loading ? (
            <LoaderWrapper>
              <Loader
                type="TailSpin"
                color="rgb(98, 126, 234"
                height={100}
                width={100}
                timeout={0}
              />
            </LoaderWrapper>
          ) : (
            <InputWrapper>
              <StyledInput
                placeholder="Send Image Link"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setInputValue(e.target.value);
                }}
              />
              <SubmitButton disabled={!inputValue.length} onClick={sendImage}>
                Submit
              </SubmitButton>
            </InputWrapper>
          )}
          <ImagesWrapper>
            {imageList.map(
              ({ imageLink }: { imageLink: string }, index: number) => (
                <ImageWrapper key={index}>
                  <Image src={imageLink} alt={imageLink} />
                </ImageWrapper>
              )
            )}
          </ImagesWrapper>
        </InputImagesWrapper>
      )}
    </Wrapper>
  );
}

export default App;
