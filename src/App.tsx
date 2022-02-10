import {
    ChangeEvent,
    FormEvent,
    Fragment,
    useEffect,
    useRef,
    useState,
} from 'react';
import Peer from 'peerjs';
import './reset.css';
import './App.scss';
import { MessageType, Messages } from './Messages/Messages';

function App() {
    const connections = useRef<Array<Peer.DataConnection>>([]);
    const [messages, setMessages] = useState<Array<MessageType>>([]);
    const [messageInput, setMessageInput] = useState<string>('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isConnectionStarter = params.has('peerId');
        const peer = new Peer();

        peer.on('open', (id) => {
            if (isConnectionStarter) {
                const conn = peer.connect(params.get('peerId') || '');
                // Is triggered directly after initiating the connection (line above):
                conn.on('open', () => handleCommunication(conn));
            } else {
                params.set('peerId', id);
                window.history.replaceState(
                    {},
                    '',
                    `${location.pathname}?${params}`,
                );
                // event listener that triggers for the receiver, after the connection is started:
                peer.on('connection', handleCommunication);
            }
        });

        function handleCommunication(connection: Peer.DataConnection) {
            connections.current.push(connection);

            // Receiving a message:
            connection.on('data', (newMessage) => {
                setMessages([...messages, newMessage]);
            });
        }
    }, []);

    function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!messageInput) return;

        const newMessage: MessageType = {
            isSender: true,
            text: messageInput,
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
        connections.current.forEach((conn) => conn.send(newMessage));
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        setMessageInput(e.target.value);
    }

    return (
        <Fragment>
            <main>
                <Messages messages={messages} />

                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        id="message"
                        title="message"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Typ een bericht"
                    />
                    <button className="visually-hidden">Send</button>
                </form>
            </main>

            <aside>
                <h1>Chat POC to experiment with the PeerJS library</h1>
                <p>It creates a simple WebRTC peer-to-peer connection.</p>
                <ol>
                    <li>
                        Go to the{' '}
                        <a href="https://infallible-gates-ab17b0.netlify.app">
                            main url
                        </a>
                    </li>
                    <li>
                        As you can see, the url gets changed; a unique peerId is
                        added. You can share this new url with a friend.
                    </li>
                    <li>
                        When your friend loads the page with that url, you can
                        chat with each other.
                    </li>
                    <li>No server is used! Just HTML, CSS, JS on a CDN 😃</li>
                </ol>
            </aside>
        </Fragment>
    );
}

export default App;
