import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { learningApi } from '../api/client';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Loader2,
  HelpCircle
} from 'lucide-react';

export function TutorChat({ conceptSlug, conceptTitle }) {
  const { language, t } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your ConceptClear AI Tutor. I can explain ${conceptTitle || 'this concept'} with step-by-step reasoning, real-world analogies, or in Hindi/Marathi. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await learningApi.chatTutor({
        concept_slug: conceptSlug || 'fractions',
        message: query,
        language: language || 'en'
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: response.reply || response.response || 'Here is an explanation to guide your understanding.',
          analogy: response.analogy,
          example: response.worked_example
        }
      ]);
    } catch (err) {
      console.error('Tutor chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm having a momentary connection glitch, but remember: in mathematics, breaking the problem down into simple prime components always helps. Try asking again!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptChips = [
    { label: 'Real-World Analogy 🌍', prompt: `Explain ${conceptTitle || 'this concept'} using a real-world analogy.` },
    { label: 'Common Mistakes ⚠️', prompt: `What is the most common misconception or pitfall students make in ${conceptTitle || 'this topic'}?` },
    { label: 'Step-by-step Example 📝', prompt: `Show me a step-by-step worked example for ${conceptTitle || 'this concept'}.` },
    { label: 'Explain in Hindi 🇮🇳', prompt: `कृपया मुझे यह अवधारणा हिंदी में सरल उदाहरण के साथ समझाएं।` }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}
    >
      {/* Tutor Header */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          background: 'linear-gradient(135deg, var(--navy-900), #1E1B4B)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-violet))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>ConceptClear AI Tutor</div>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
              Multilingual Cognitive Assistant ({language.toUpperCase()})
            </div>
          </div>
        </div>

        <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
          Live Support
        </span>
      </div>

      {/* Message Stream */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: '#F8FAFC'
        }}
      >
        {messages.map((m, idx) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              {isAI && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <Sparkles size={14} color="#FFFFFF" />
                </div>
              )}

              <div
                style={{
                  background: isAI ? '#FFFFFF' : 'var(--primary-blue)',
                  color: isAI ? 'var(--text-main)' : '#FFFFFF',
                  padding: '0.85rem 1rem',
                  borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  border: isAI ? '1px solid var(--border-color)' : 'none'
                }}
              >
                {m.text}

                {m.analogy && (
                  <div
                    style={{
                      marginTop: '0.65rem',
                      padding: '0.65rem',
                      background: 'var(--primary-blue-light)',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--primary-blue)',
                      fontSize: '0.85rem',
                      color: 'var(--navy-900)'
                    }}
                  >
                    <strong>🌍 Analogy:</strong> {m.analogy}
                  </div>
                )}
              </div>

              {!isAI && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--navy-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <User size={14} color="#FFFFFF" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Loader2 className="animate-spin" size={16} color="var(--primary-blue)" />
            <span>AI Tutor is crafting explanation...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div
        style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.775rem', padding: '0.25rem 0.65rem', whiteSpace: 'nowrap' }}
            onClick={() => handleSend(chip.prompt)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          padding: '0.75rem 1rem',
          gap: '0.5rem',
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <input
          type="text"
          className="form-input"
          placeholder={t('aiTutorChatPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: '0.6rem 0.85rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0.6rem 1rem' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
