import { useState } from 'react';

const Index = () => {
    const [message, setMessage] = useState('');
    const getClipboardData = async () => {
        setMessage('Läd....');
        try {
            let dienstplan = await navigator.clipboard.readText();
            const response = await fetch('/api/update', {
                method: 'POST',

                body: dienstplan,
            });
            const data = await response.json();
            setMessage(data.text);
        } catch (error) {
            setMessage((error as Error).message);
        }
    };

    return (
        <div>
            <h1>Dienstplan App</h1>
            <button onClick={() => getClipboardData()}>Update</button>
            <p>{message}</p>
        </div>
    );
};

export default Index;
