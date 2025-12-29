"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MoreVertical } from 'lucide-react';

const ChatWindow = ({
    messages,
    onSendMessage,
    onEndChat,
    isLoading,
    isEnded,
    currentUserId
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading && !isEnded) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 sm:w-[380px] dark:bg-slate-900 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white dark:from-blue-700 dark:to-blue-800">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                            CS
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-blue-600 bg-green-400 dark:border-blue-700"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">CS Xinxun</h3>
                        <p className="text-xs text-blue-100 dark:text-blue-200">
                            {isEnded ? "Chat Ended" : "Online"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={onEndChat}
                        disabled={isEnded}
                        className="rounded-full p-2 text-blue-100 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        title="End Chat"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-slate-950">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            Today
                        </span>
                    </div>

                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';

                        // Render HTML content safely since API returns HTML
                        return (
                            <div
                                key={index}
                                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser
                                            ? 'rounded-br-none bg-blue-600 text-white dark:bg-blue-600'
                                            : 'rounded-bl-none bg-white text-gray-800 dark:bg-slate-800 dark:text-gray-100'
                                        }`}
                                >
                                    {isUser ? (
                                        msg.content
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    )}
                                    <span className={`mt-1 block text-right text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-400'
                                        }`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-none bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-0"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEnded && (
                        <div className="flex justify-center py-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Chat session has ended
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isEnded || isLoading}
                        placeholder={isEnded ? "Start a new chat to continue..." : "Type your message..."}
                        className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:ring-blue-600"
                        rows="1"
                        style={{ height: '44px' }}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || isEnded}
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-slate-700"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
