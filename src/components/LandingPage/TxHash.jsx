export function TxHash({ hash }) {

    return (
        <div className="transaction-hash">
            <p>Transaction hash: {hash}</p>
            <a 
                href={"https://rinkeby.etherscan.io//tx/" + hash}
                target="_blank" 
                rel="noopener noreferrer" 
                class="cta-button blur"
            >
                View on Etherscan
            </a>
        </div>
    );

}