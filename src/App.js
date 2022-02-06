import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"
const CONTRACT_ADDRESS = "0x5f3F6606c92fcffb7760A7db9596610115444020"

const checkIfWalletIsConnected = async (setCurrentAccount) => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      console.log("make sure you have metamask")
      return
    }

    console.log("we have the ethereum object", ethereum)
    const accounts = await ethereum.request({method: "eth_accounts"})

    if (accounts.length == 0) {
      console.log("NO authorized account found")
      return
    }

    setCurrentAccount(accounts[0])

  } catch (error) {
    console.error(error)
  }
}

const connectWallet = async (setCurrentAccount) => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      alert("Get Metamask")
      return
    }

    const accounts = await ethereum.request({method: "eth_requestAccounts"})
    setCurrentAccount(accounts[0])

  } catch (error) {
    console.error(error)
  }
}

const getAllWaves = async (setAllWaves) => {
  try {
    const { ethereum } = window
    if (!ethereum) {
      alert("Get Metamask")
      return
    }

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS,abi.abi, signer)

    const waves = await wavePortalContract.getAllWaves()

    let wavesCleaned = waves.map(w => {
      return {
        address: w.address,
        timestamp: new Date(w.timestamp * 1000),
        message: w.message
      }})

    setAllWaves(wavesCleaned)
  } catch (error) {
    console.error(error)
  }
}
export default function App() {

  const [currentAccout, setCurrentAccount] = useState()
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState("")
  const wave = async (message) => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Get Metamask")
        return
      }

      if (!message) {
        alert("Enter message")
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS,abi.abi, signer)

      window.wavePortalContract = wavePortalContract
      let count = await wavePortalContract.getTotalWaves()
      console.log("retrieved total wave: ", count.toNumber())

      const waveTxn = await wavePortalContract.wave(message)
      console.log("mining ..", waveTxn.hash)

      count = await wavePortalContract.getTotalWaves()
      console.log("retrieved total wave: ", count.toNumber())

    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount)
  }, [])

  useEffect(() => {
    getAllWaves(setAllWaves)
  }, [currentAccout])

  useEffect(() => {
    console.log(message)
  }, [message])

  return (
    <div className="mainContainer">

      <div className="dataContainer">

        <div className="header">
        👋 Hey there!
        </div>
        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
          <br/>
          your address: {currentAccout && currentAccout.slice(0,10)}
        </div>

        <input value={message} onChange={({target}) => setMessage(target.value)} />
        <button className="waveButton" onClick={() => wave(message)}>
          Wave at Me
        </button>

        {!currentAccout && (
          <button className="waveButton" onClick={() => connectWallet(setCurrentAccount)}>
            connect wallet
          </button>
        ) }

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
