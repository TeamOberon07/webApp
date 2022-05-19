export function TxHash({ hash }) {

    return (
        <div className="transaction-hash">
            <button 
                onClick={() => window.open("https://rinkeby.etherscan.io/tx/" + hash, '_blank').focus() }
                className="cta-button blur"
              >
                View on Etherscan
            </button> 
            <button 
                onClick={() => window.location.href = '/'}
                className="cta-button blur"
              >
                Go to Your Orders
            </button> 
        </div>
    );

}