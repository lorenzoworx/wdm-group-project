import React from 'react';
import Body from './components/Body';
import ChatbotFloating from './components/ChatbotFloating';

function App() {
    return (
        <div>
            <Body />  {/* <-- show the Firestore-backed UI */}
            <ChatbotFloating />
        </div>
    );
}

export default App;
