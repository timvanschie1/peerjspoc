import React from 'react';
import './Messages.scss';

export type MessageType = {
    isSender: boolean;
    text: string;
};

export function Messages({ messages }: { messages: MessageType[] }) {
    return (
        <div id="allMessages" className="messages">
            {messages.map(({ isSender, text }, i) => (
                <p key={i} className={isSender ? 'me' : 'friend'}>
                    {text}
                </p>
            ))}
        </div>
    );
}
