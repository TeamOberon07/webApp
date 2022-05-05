import { Error } from "./Error";

export function Button({ method, id, text, amount }) {
    // console.log(JSON.stringify(method)  + " " + id + " " +  text  + " " +  amount )
    return (
        <form onSubmit={(event) => {
            event.preventDefault();
                if(id){
                   var error =  method(id, amount);
                   if (error)
                    return <Error message={error}/>;
                }
        }}>
            <div className="button-label-select">
                <input className="cta-button basic-button blur" type="submit" value={text} />
                {/*<label className="label-selectBox">{ "Oreder to " + text.toLowerCase() }</label>
                 <select id="orderIDs" name="orderIDs" className="blur">
                <option value={id}>{id}</option>
                </select> */}
            </div>
        </form>
    );
}