import { ethers } from "ethers";

var url = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
var customHttpProvider = new ethers.providers.JsonRpcProvider(url);
customHttpProvider.getBlockNumber().then((result) => {
    console.log("Current block number: " + result);
});