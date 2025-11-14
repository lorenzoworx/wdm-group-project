import React from 'react';
import Body from './components/Body';
import ChatbotFloating from './components/ChatbotFloating';
import MessageBoard from './MessageBoard';

function App() {
    return (
        <div>
            <Body />  {/* <-- show the Firestore-backed UI */}
            <ChatbotFloating />
        </div>
    );
}

export default App;
