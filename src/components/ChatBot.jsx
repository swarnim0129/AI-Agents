import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaUser, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I can help you understand the ML Analytics platform. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message:', userMessage); // Debug log

      const response = await axios.post('http://localhost:5001/api/chat', {
        message: userMessage
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Received response:', response.data); // Debug log

      if (response.data.response) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.response
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <FaRobot className="text-2xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <FaRobot className="text-xl mr-2" />
          <h3 className="font-medium">ML Analytics Assistant</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.type === 'user' ? (
                  <FaUser className="text-sm" />
                ) : (
                  <FaRobot className="text-sm" />
                )}
                <span className="text-xs font-medium">
                  {message.type === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the ML Analytics platform..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 