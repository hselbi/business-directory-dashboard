'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  type: string;
  message?: string;
  timestamp: string;
  clientId?: string;
  originalMessage?: any;
  serverTimestamp?: string;
  status?: string;
}

export default function SocketTester() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:8080/socket');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    setMessages([]);

    try {
      wsRef.current = new WebSocket(serverUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        setIsConnected(true);
        setConnectionStatus('connected');
        addMessage({
          type: 'system',
          message: 'Connected to WebSocket server',
          timestamp: new Date().toISOString()
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 Received:', data);
          addMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
          addMessage({
            type: 'error',
            message: 'Failed to parse server message',
            timestamp: new Date().toISOString()
          });
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 Connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        addMessage({
          type: 'system',
          message: `Connection closed (${event.code}: ${event.reason || 'No reason'})`,
          timestamp: new Date().toISOString()
        });
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        addMessage({
          type: 'error',
          message: 'WebSocket connection error',
          timestamp: new Date().toISOString()
        });
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addMessage({
        type: 'error',
        message: 'WebSocket is not connected',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!inputMessage.trim()) {
      return;
    }

    const messageData = {
      type: 'test',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    wsRef.current.send(JSON.stringify(messageData));
    addMessage({
      type: 'sent',
      message: inputMessage,
      timestamp: new Date().toISOString()
    });
    setInputMessage('');
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'connection':
      case 'system':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'sent':
        return 'bg-green-100 border-green-300 text-green-800 ml-auto max-w-xs';
      case 'echo':
        return 'bg-gray-100 border-gray-300 text-gray-800 max-w-xs';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'ping':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 text-sm';
      case 'broadcast':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">WebSocket Connection Tester</h1>
      
      {/* Connection Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Server URL:</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="ws://localhost:8080/socket"
              disabled={isConnected}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <button
              onClick={connect}
              disabled={connectionStatus === 'connecting' || isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
            </button>
            
            <button
              onClick={disconnect}
              disabled={!isConnected}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              Disconnect
            </button>
            
            <div className={`text-sm font-medium ${getStatusColor()}`}>
              Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 border border-gray-300 rounded"
            placeholder="Enter message to send..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
        <h3 className="font-medium mb-3">Messages:</h3>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No messages yet. Connect to the server to start receiving messages.
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${getMessageStyle(msg.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-xs opacity-70 mb-1">
                      {msg.type.toUpperCase()} - {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="font-medium">
                      {msg.message || JSON.stringify(msg.originalMessage) || 'Ping'}
                    </div>
                    {msg.serverTimestamp && (
                      <div className="text-xs opacity-60 mt-1">
                        Server time: {new Date(msg.serverTimestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Connection Stats */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>Total Messages: {messages.length}</div>
          <div>Connection State: {wsRef.current?.readyState ?? 'Not initialized'}</div>
        </div>
      </div>
    </div>
  );
}