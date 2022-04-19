import { Loading } from "../Loading";

export function Notify({ hasNotified }) {
    return (<>
    { !hasNotified &&
        <Loading text='Notifying e-commerce...' />
    }

    { hasNotified &&
        <p style={{'fontSize': '2em', 'margin': '2em', 'textAlign': 'center'}}>E-commerce notified correctly</p>
    }
    </>);
}