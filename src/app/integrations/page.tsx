'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ExternalLink, Mic, Image, Bot, Cloud, Mail, Calendar, Zap, Shield, Globe } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  freeLimit: string;
  docsUrl: string;
  connected: boolean;
}

const integrations: Integration[] = [
  // Voice & Speech
  {
    id: 'google-tts',
    name: 'Google Cloud TTS',
    description: 'High-quality text-to-speech with 220+ voices',
    category: 'Voice & Speech',
    icon: <Mic className="w-6 h-6" />,
    features: ['220+ voices', '40+ languages', 'WaveNet quality', 'SSML support'],
    freeLimit: '4 million chars/month FREE',
    docsUrl: 'https://cloud.google.com/text-to-speech',
    connected: false,
  },
  {
    id: 'google-stt',
    name: 'Google Speech-to-Text',
    description: 'Convert audio to text with high accuracy',
    category: 'Voice & Speech',
    icon: <Mic className="w-6 h-6" />,
    features: ['Real-time streaming', '125+ languages', 'Automatic punctuation', 'Speaker diarization'],
    freeLimit: '60 mins/month FREE',
    docsUrl: 'https://cloud.google.com/speech-to-text',
    connected: false,
  },
  {
    id: 'web-speech',
    name: 'Web Speech API',
    description: 'Browser-native speech recognition & synthesis',
    category: 'Voice & Speech',
    icon: <Globe className="w-6 h-6" />,
    features: ['No API key needed', 'Works offline', 'Browser native', 'Free forever'],
    freeLimit: 'Unlimited - Built into browser',
    docsUrl: 'https://developer.mozilla.org/docs/Web/API/Web_Speech_API',
    connected: true,
  },
  
  // Image Generation
  {
    id: 'stability-ai',
    name: 'Stability AI',
    description: 'Generate images with Stable Diffusion',
    category: 'Image Generation',
    icon: <Image className="w-6 h-6" />,
    features: ['Stable Diffusion XL', 'Image-to-image', 'Inpainting', 'High resolution'],
    freeLimit: '25 free credits on signup',
    docsUrl: 'https://platform.stability.ai',
    connected: false,
  },
  {
    id: 'pollinations',
    name: 'Pollinations AI',
    description: '100% free image generation API',
    category: 'Image Generation',
    icon: <Image className="w-6 h-6" />,
    features: ['No API key', 'No rate limits', 'Multiple models', 'Simple URL API'],
    freeLimit: 'Unlimited - Completely FREE',
    docsUrl: 'https://pollinations.ai',
    connected: false,
  },
  {
    id: 'google-vision',
    name: 'Google Cloud Vision',
    description: 'Image analysis, OCR, and object detection',
    category: 'Image Generation',
    icon: <Image className="w-6 h-6" />,
    features: ['Object detection', 'OCR text extraction', 'Face detection', 'Label detection'],
    freeLimit: '1000 images/month FREE',
    docsUrl: 'https://cloud.google.com/vision',
    connected: false,
  },
  
  // AI & LLMs
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    description: 'Multimodal AI for text, images, and code',
    category: 'AI & LLMs',
    icon: <Bot className="w-6 h-6" />,
    features: ['Multimodal', 'Long context', 'Code generation', 'Vision understanding'],
    freeLimit: '60 requests/min FREE',
    docsUrl: 'https://ai.google.dev',
    connected: false,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LLM inference',
    category: 'AI & LLMs',
    icon: <Zap className="w-6 h-6" />,
    features: ['Fastest inference', 'Llama 3', 'Mixtral', 'Free tier'],
    freeLimit: '14,400 requests/day FREE',
    docsUrl: 'https://console.groq.com',
    connected: false,
  },
  {
    id: 'together-ai',
    name: 'Together AI',
    description: 'Open source models API',
    category: 'AI & LLMs',
    icon: <Bot className="w-6 h-6" />,
    features: ['100+ models', 'Fine-tuning', 'Embeddings', 'Fast inference'],
    freeLimit: '$25 free credits',
    docsUrl: 'https://together.ai',
    connected: false,
  },
  
  // Productivity
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Calendar management and scheduling',
    category: 'Productivity',
    icon: <Calendar className="w-6 h-6" />,
    features: ['Event management', 'Reminders', 'Shared calendars', 'Google Meet integration'],
    freeLimit: 'Unlimited - Free with Google account',
    docsUrl: 'https://developers.google.com/calendar',
    connected: false,
  },
  {
    id: 'gmail-api',
    name: 'Gmail API',
    description: 'Read and send emails programmatically',
    category: 'Productivity',
    icon: <Mail className="w-6 h-6" />,
    features: ['Read emails', 'Send emails', 'Manage labels', 'Search messages'],
    freeLimit: 'Unlimited - Free with Google account',
    docsUrl: 'https://developers.google.com/gmail',
    connected: true,
  },
  
  // Infrastructure
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN, DNS, and edge computing',
    category: 'Infrastructure',
    icon: <Cloud className="w-6 h-6" />,
    features: ['Global CDN', 'DDoS protection', 'SSL/TLS', 'Workers (serverless)'],
    freeLimit: 'Generous free tier',
    docsUrl: 'https://developers.cloudflare.com',
    connected: false,
  },
  {
    id: 'uptime-robot',
    name: 'UptimeRobot',
    description: 'Website uptime monitoring',
    category: 'Infrastructure',
    icon: <Shield className="w-6 h-6" />,
    features: ['5-min checks', '50 monitors', 'Email alerts', 'Status pages'],
    freeLimit: '50 monitors FREE',
    docsUrl: 'https://uptimerobot.com',
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(['web-speech', 'gmail-api']);
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];
  const filtered = filter === 'all' ? integrations : integrations.filter(i => i.category === filter);

  const toggleConnection = async (id: string) => {
    if (connectedIntegrations.includes(id)) {
      setConnectedIntegrations(connectedIntegrations.filter(i => i !== id));
    } else {
      // In real implementation, this would open OAuth flow or show setup modal
      setConnectedIntegrations([...connectedIntegrations, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold">Integrations & Plugins</h1>
            <p className="text-slate-400 text-sm">Connect free services to enhance Mission Control</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded text-sm transition ${
                filter === cat ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(integration => (
          <div
            key={integration.id}
            className={`bg-slate-800/50 border rounded-xl p-5 transition ${
              connectedIntegrations.includes(integration.id)
                ? 'border-teal-500/50 card-glow'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  connectedIntegrations.includes(integration.id)
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{integration.name}</h3>
                  <span className="text-xs text-slate-500">{integration.category}</span>
                </div>
              </div>
              {connectedIntegrations.includes(integration.id) && (
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <p className="text-sm text-slate-400 mb-3">{integration.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {integration.features.slice(0, 3).map(f => (
                <span key={f} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                  {f}
                </span>
              ))}
            </div>

            <div className="text-xs text-green-400 mb-4">
              ✨ {integration.freeLimit}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleConnection(integration.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  connectedIntegrations.includes(integration.id)
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {connectedIntegrations.includes(integration.id) ? 'Disconnect' : 'Connect'}
              </button>
              <a
                href={integration.docsUrl}
                target="_blank"
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Setup Guide */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">🚀 Quick Setup Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Google Cloud (TTS, STT, Vision)</h3>
            <ol className="list-decimal list-inside text-slate-400 space-y-1">
              <li>Go to <a href="https://console.cloud.google.com" className="text-teal-400">console.cloud.google.com</a></li>
              <li>Create a new project</li>
              <li>Enable the API you need</li>
              <li>Create credentials (Service Account)</li>
              <li>Download JSON key and add here</li>
            </ol>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Pollinations AI (Images)</h3>
            <ol className="list-decimal list-inside text-slate-400 space-y-1">
              <li>No setup needed!</li>
              <li>Use URL: <code className="bg-slate-800 px-1 rounded">pollinations.ai/p/[prompt]</code></li>
              <li>Completely free, no API key</li>
              <li>Example: pollinations.ai/p/sunset+beach</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
