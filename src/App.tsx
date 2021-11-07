import React, { useEffect, useState } from "react";
import styled from "styled-components";

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

const InputImagesWrapper = styled.div``;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px auto 0;

  @media (max-width: 600px) {
    margin: 0 12px;
    flex-direction: column;
  }
`;

const StyledInput = styled.input`
  max-width: 360px;
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

declare global {
  interface Window {
    solana?: any;
  }
}

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState<string[]>([]);

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

  useEffect(() => {
    window.addEventListener("load", async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  return (
    <Wrapper>
      <h2>Architecture Wall</h2>
      <p>Architecture inspo in the metaverse ✨</p>
      {!walletAddress ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <InputImagesWrapper>
          <InputWrapper>
            <StyledInput
              placeholder="Enter a message"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInputValue(e.target.value);
              }}
            />
            <SubmitButton>Submit</SubmitButton>
          </InputWrapper>
          <ImagesWrapper>
            {gifList.map((gif) => (
              <ImageWrapper key={gif}>
                <Image src={gif} alt={gif} />
              </ImageWrapper>
            ))}
          </ImagesWrapper>
        </InputImagesWrapper>
      )}
    </Wrapper>
  );
}

export default App;
