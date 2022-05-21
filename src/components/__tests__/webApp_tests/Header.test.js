import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom";
import { Header } from "../../Header"
import { StateContext} from "../../StateContext"

test("visualizzazione address utente", ()=>{
    
    render(<StateContext.Provider value={ {
       currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
       currentBalance:"",
       contractAddress:"",
       networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},

        ourNetwork: "rinkeby",
       _cutAddress:() =>{ return "0xe5B1...797482"},
        _connectWallet:() =>{},
       _setListenerMetamaskAccount:() =>{},
 
     }}>
       <BrowserRouter>
            <Header></Header>
       </BrowserRouter>
   </StateContext.Provider>)
    
    expect(screen.getAllByText("0xe5B1...797482"));
})