export function TxHash({ hash }) {

    return (
        <div className="transaction-hash">
            <p>Transaction hash: {hash}</p>
            <a href={"https://testnet.snowtrace.io/tx/" + hash} target="_blank" rel="noopener noreferrer">View on Snowtrace</a>
        </div>
    );

}