
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  ShieldCheck, 
  Settings, 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  Info,
  ChevronRight,
  UserCircle,
  UserPlus,
  Camera,
  Award,
  Volume2,
  EyeOff,
  Clock,
  CircleHelp,
  Check,
  Send,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Smartphone,
  Paperclip,
  MoreVertical,
  X,
  UserX,
  Phone,
  Mic,
  PhoneOff,
  VolumeX,
  MicOff,
  Maximize2,
  Bell,
  Trash2,
  AlertCircle,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { CourseModule, Lesson, Achievement, ChatMessage } from './types_app';

const MODULES: CourseModule[] = [
  {
    id: 0,
    title: "Configuração Inicial",
    description: "Do baixar ao primeiro 'Oi'.",
    icon: <Smartphone size={32} />,
    lessons: [
      { id: "0-1", title: "Como Baixar o Aplicativo", videoUrl: "#", content: "1. Procure o desenho de uma sacola colorida (Play Store). 2. Escreva 'WhatsApp' na barra de cima. 3. Toque no botão verde 'Instalar'. 4. Espere a barrinha encher!" },
      { id: "0-2", title: "Ativando seu Número", videoUrl: "#", content: "1. Abra o aplicativo. 2. Toque em 'Concordar'. 3. Coloque seu número com o DDD da sua cidade. 4. Você vai receber uma mensagem com 6 números. Digite esses números no aplicativo." }
    ]
  },
  {
    id: 5,
    title: "Chamadas de Voz",
    description: "Fale com seus amigos sem pagar mais.",
    icon: <Phone size={32} />,
    lessons: [
      { id: "5-1", title: "Iniciando uma Chamada", videoUrl: "#", content: "1. Entre na conversa da pessoa. 2. Procure o desenho de um telefone no topo da tela. 3. Toque nele e espere a pessoa atender!", type: 'instruction' },
      { id: "5-2", title: "Como Desligar e Viva-voz", videoUrl: "#", content: "1. O botão vermelho serve para encerrar. 2. O botão de alto-falante serve para ouvir mais alto sem encostar no ouvido.", type: 'instruction' }
    ]
  },
  {
    id: 3,
    title: "Segurança e Privacidade",
    description: "Xô, gente chata e golpes!",
    icon: <ShieldCheck size={32} />,
    lessons: [
      { id: "3-1", title: "Como Bloquear Alguém", videoUrl: "#", content: "1. Entre na conversa de quem te incomoda. 2. Toque no nome dela lá em cima. 3. Desça a tela até o final. 4. Toque no botão vermelho escrito 'Bloquear'.", type: 'security' },
      { id: "3-2", title: "Ocultar 'Visto por Último'", videoUrl: "#", content: "1. Na tela inicial, toque nos três pontinhos no canto superior. 2. Toque em 'Configurações' e depois em 'Privacidade'. 3. Toque em 'Visto por último e online'. 4. Escolha a opção 'Ninguém'. Isso impede que outras pessoas saibam a hora exata que você usou o celular, garantindo mais privacidade e sossego.", type: 'security' },
      { id: "3-3", title: "Mensagens Temporárias", videoUrl: "#", content: "1. Entre na conversa com seu amigo. 2. Toque no nome dele lá no topo da tela. 3. Procure a opção 'Mensagens temporárias' (tem o desenho de um reloginho). 4. Escolha um tempo para as mensagens sumirem. Isso ajuda muito a não lotar a memória do seu celular com fotos e textos antigos, além de manter suas conversas mais discretas.", type: 'security' }
    ]
  },
  {
    id: 4,
    title: "Recursos Avançados",
    description: "Novidades que facilitam sua vida.",
    icon: <Zap size={32} />,
    lessons: [
      { id: "4-1", title: "Visualização Única", videoUrl: "#", content: "1. Escolha uma foto para enviar. 2. Antes de apertar a setinha de enviar, procure um círculo pequeno com o número '1' dentro. 3. Toque nesse '1' até ele ficar colorido. 4. Pronto! Quando a pessoa abrir a foto, ela vai sumir logo depois. Isso é ótimo para enviar documentos ou informações privadas que não devem ficar guardadas no celular de outra pessoa.", type: 'instruction' }
    ]
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'setup_ok', title: 'Primeiros Passos', icon: <Smartphone />, description: 'Já sabe instalar e começar!', unlocked: false },
  { id: 'voice_hero', title: 'Voz do Zap', icon: <Phone />, description: 'Mestre das ligações de voz!', unlocked: false },
  { id: 'shield_hero', title: 'Segurança Total', icon: <ShieldCheck />, description: 'Aprendeu a bloquear e denunciar.', unlocked: false },
  { id: 'training_pro', title: 'Mestre do Treino', icon: <CheckCircle2 />, description: 'Praticou sem medo de errar!', unlocked: false }
];

const SYSTEM_INSTRUCTION = `Você é o Seu Guia Digital, o assistente do aplicativo Guia WhatsApp Fácil. 
Sua missão é ensinar pessoas com mais de 40 anos a usarem o WhatsApp com total paciência e clareza.
REGRAS OBRIGATÓRIAS DE RESPOSTA:
1. Linguagem simples: NUNCA use termos técnicos ou em inglês (use "desenho do clipe" em vez de "anexo").
2. Explique TUDO em passos numerados (1, 2, 3...).
3. Seja sempre calmo e encorajador. Termine com "Pode confiar, você vai conseguir!".`;

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'module' | 'lesson' | 'training' | 'achievements' | 'ai_guide'>('home');
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isQuickHelping, setIsQuickHelping] = useState(false);
  
  // Simulation State
  const [trainingTask, setTrainingTask] = useState<'media' | 'block' | 'call' | 'none'>('none');
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [simMessages, setSimMessages] = useState<ChatMessage[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showProfileInTraining, setShowProfileInTraining] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o seu Guia Digital. Estou aqui para tirar qualquer dúvida sobre o WhatsApp. O que quer aprender agora?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, simMessages, isTyping]);

  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCalling]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: userMsg.text }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Pode repetir por favor?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Tive um probleminha na conexão. Pode tentar perguntar de novo?" }]);
    } finally { setIsTyping(false); }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Leia de forma bem calma e clara para um idoso: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const arrayBuffer = base64ToArrayBuffer(base64Audio);
        const audioBuffer = await decodeAudioData(arrayBuffer, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      }
    } catch (e) { setIsSpeaking(false); }
  };

  const handleQuickHelp = async () => {
    if (isQuickHelping || isSpeaking) return;
    setIsQuickHelping(true);
    
    let contextPrompt = "";
    switch(view) {
      case 'home': contextPrompt = "Estou na tela inicial do aplicativo. Explique o que posso fazer aqui de forma muito simples."; break;
      case 'training': contextPrompt = "Estou no modo de treino simulando o WhatsApp. Explique que nada aqui é real e eu posso praticar sem medo."; break;
      case 'lesson': contextPrompt = `Estou aprendendo sobre ${activeLesson?.title}. Dê uma dica rápida sobre esse assunto.`; break;
      case 'achievements': contextPrompt = "Estou vendo minhas medalhas e prêmios. Me dê um parabéns incentivador."; break;
      case 'ai_guide': contextPrompt = "Estou conversando com você no chat. Diga que estou no lugar certo para tirar dúvidas."; break;
      default: contextPrompt = "Olá, como posso te ajudar nesta tela?";
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });
      const text = response.text || "Estou aqui para ajudar!";
      await handleSpeak(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuickHelping(false);
    }
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
  };

  const decodeAudioData = async (data: ArrayBuffer, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startTraining = (task: 'media' | 'block' | 'call') => {
    setTrainingTask(task);
    setIsBlocked(false);
    setIsCalling(false);
    setShowProfileInTraining(false);
    setShowAttachmentMenu(false);
    setShowBlockConfirm(false);
    
    let initialText = 'Estou pronto para treinar com você!';
    if (task === 'call') initialText = 'Vamos praticar! Toque no desenho do telefone azul lá no topo para me ligar.';
    if (task === 'block') initialText = 'Para treinar o bloqueio, toque no nome do contato lá em cima para abrir o perfil dele.';
    if (task === 'media') initialText = 'Para enviar uma foto, comece tocando no desenho do clipe de papel lá embaixo.';
    
    setSimMessages([{ role: 'model', text: initialText }]);
    handleSpeak(initialText); 
    setView('training');
  };

  const handleSimAction = (action: string) => {
    if (action === 'start_call') {
      setIsCalling(true);
      const text = 'Muito bem, a ligação começou! Quando quiser desligar, toque no botão redondo vermelho que está no meio da tela.';
      setSimMessages(prev => [...prev, { role: 'user', text: '[Iniciou a Ligação]' }, { role: 'model', text: text }]);
      handleSpeak(text);
    }
    if (action === 'end_call') {
      setIsCalling(false);
      const text = 'Parabéns! Você desligou certinho no botão vermelho. Treinar assim ajuda a perder o medo, não é mesmo?';
      setSimMessages(prev => [...prev, { role: 'model', text: text }]);
      handleSpeak(text);
      unlockAchievement('voice_hero');
      unlockAchievement('training_pro');
    }
    if (action === 'send_photo') {
      const text = 'Perfeito! Você aprendeu a enviar fotos. Seus amigos e família vão adorar receber imagens suas!';
      setSimMessages(prev => [...prev, { role: 'user', text: '[Enviou uma Foto]' }, { role: 'model', text: text }]);
      handleSpeak(text);
      unlockAchievement('training_pro');
    }
    if (action === 'block') {
      setIsBlocked(true);
      setShowProfileInTraining(false);
      setShowBlockConfirm(false);
      const text = 'Prontinho! Você bloqueou este contato com segurança. Agora ele não pode mais te incomodar com mensagens ou ligações.';
      setSimMessages(prev => [...prev, { role: 'model', text: text }]);
      handleSpeak(text);
      unlockAchievement('shield_hero');
      unlockAchievement('training_pro');
    }
    if (action === 'unblock') {
      setIsBlocked(false);
      const text = 'Ótimo! Você desbloqueou o contato. Agora o botão de enviar mensagens voltou a funcionar normalmente.';
      setSimMessages(prev => [...prev, { role: 'model', text: text }]);
      handleSpeak(text);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, unlocked: true } : a));
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1B365D] font-sans pb-24 select-none relative">
      {/* Botão de Ajuda Rápida Flutuante */}
      <button 
        onClick={handleQuickHelp}
        disabled={isQuickHelping}
        className={`fixed bottom-28 right-6 z-50 flex flex-col items-center gap-1 bg-[#25D366] text-white p-4 rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all active:scale-90 border-4 border-white animate-bounce-subtle ${isQuickHelping || isSpeaking ? 'opacity-50 grayscale' : ''}`}
      >
        {isQuickHelping || isSpeaking ? <Volume2 className="animate-pulse" size={32} /> : <HelpCircle size={32} />}
        <span className="text-[10px] font-black uppercase tracking-wider">{isSpeaking ? 'Falando' : 'Ajuda'}</span>
      </button>

      {/* Header */}
      <header className="bg-[#1B365D] text-white p-6 sticky top-0 z-40 shadow-xl border-b-4 border-[#25D366]">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="flex items-center gap-2 font-black text-lg bg-white/10 px-5 py-2 rounded-full active:scale-95">
              <ArrowLeft size={24} /> <span>VOLTAR</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl text-[#25D366]"><MessageSquare size={28} /></div>
              <h1 className="text-xl font-black uppercase tracking-tight">Guia WhatsApp Fácil</h1>
            </div>
          )}
          <Award size={36} className={achievements.some(a => a.unlocked) ? 'text-yellow-400' : 'text-white/30'} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[40px] p-8 mb-8 border-2 border-[#1B365D]/5 shadow-sm relative overflow-hidden">
              <h2 className="text-3xl font-black mb-3 text-[#1B365D]">Espaço de Treino</h2>
              <p className="text-xl text-gray-500 mb-8 font-medium">Aqui você pode mexer em tudo sem medo de errar!</p>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => startTraining('call')} className="bg-[#25D366] text-white p-6 rounded-3xl font-black text-xl flex items-center justify-between shadow-lg active:scale-95 transition-all">
                    <span>TREINAR LIGAÇÃO</span>
                    <Phone size={28} />
                 </button>
                 <button onClick={() => startTraining('media')} className="bg-blue-500 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-between shadow-lg active:scale-95 transition-all">
                    <span>TREINAR ENVIAR FOTO</span>
                    <Camera size={28} />
                 </button>
                 <button onClick={() => startTraining('block')} className="bg-red-500 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-between shadow-lg active:scale-95 transition-all">
                    <span>TREINAR BLOQUEAR</span>
                    <ShieldCheck size={28} />
                 </button>
              </div>
            </div>

            <h3 className="text-lg font-black mb-4 uppercase text-gray-400 tracking-widest px-2">Aprenda Passo a Passo</h3>
            <div className="grid gap-4">
              {MODULES.map((mod) => (
                <button key={mod.id} onClick={() => { setActiveModule(mod); setView('module'); }} className="bg-white rounded-[32px] p-6 flex items-center gap-6 shadow-md border-b-4 border-gray-100 active:translate-y-1 active:border-b-0">
                  <div className="bg-green-50 p-4 rounded-2xl text-[#25D366]">{mod.icon}</div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-black">{mod.title}</h3>
                    <p className="text-gray-500 font-bold">{mod.description}</p>
                  </div>
                  <ChevronRight className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: TRAINING (MODO TREINO) */}
        {view === 'training' && (
          <div className="flex flex-col h-[78vh] bg-amber-50 rounded-[40px] shadow-2xl overflow-hidden border-4 border-amber-200 animate-in zoom-in-95 relative pattern-dots">
            
            {/* Banner de Modo Treino */}
            <div className="bg-amber-400 text-amber-950 p-3 flex items-center justify-center gap-2 font-black uppercase text-sm shadow-inner z-10">
               <Info size={18} />
               <span>Modo Treino: Pratique sem medo!</span>
            </div>

            {/* Modal de Confirmação de Bloqueio */}
            {showBlockConfirm && (
              <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 animate-in fade-in">
                 <div className="bg-white w-full rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
                    <h3 className="text-2xl font-black mb-4">Bloquear Amigo (Treino)?</h3>
                    <p className="text-xl text-gray-600 mb-8 font-medium">Contatos bloqueados não poderão mais ligar para você nem enviar mensagens.</p>
                    <div className="flex flex-col gap-3">
                       <button 
                         onClick={() => handleSimAction('block')}
                         className="bg-red-500 text-white p-5 rounded-2xl font-black text-xl active:scale-95 shadow-lg"
                       >
                          BLOQUEAR
                       </button>
                       <button 
                         onClick={() => setShowBlockConfirm(false)}
                         className="bg-gray-100 text-gray-500 p-5 rounded-2xl font-black text-xl active:scale-95"
                       >
                          CANCELAR
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {showProfileInTraining && (
              <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom-8">
                 <div className="p-6 flex items-center gap-4 border-b">
                    <button onClick={() => setShowProfileInTraining(false)} className="p-2 text-[#075E54]">
                       <ArrowLeft size={32} />
                    </button>
                    <h2 className="text-2xl font-black">Dados do Contato</h2>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pb-10">
                    <div className="flex flex-col items-center py-10 bg-gray-50 mb-4">
                       <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-5xl font-black text-white mb-4">
                          A
                       </div>
                       <h3 className="text-3xl font-black">Amigo (Treino)</h3>
                       <p className="text-gray-500 font-bold text-lg">+55 11 99999-9999</p>
                    </div>

                    <div className="px-6 space-y-2 mb-8">
                       <button className="w-full p-4 flex items-center justify-between bg-white border-b">
                          <div className="flex items-center gap-4">
                             <Bell size={24} className="text-gray-400" />
                             <span className="text-xl font-bold">Silenciar notificações</span>
                          </div>
                          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                       </button>
                       <button className="w-full p-4 flex items-center gap-4 bg-white border-b">
                          <ImageIcon size={24} className="text-gray-400" />
                          <span className="text-xl font-bold">Visibilidade de mídia</span>
                       </button>
                    </div>

                    <div className="px-6 space-y-4">
                       <button 
                         onClick={() => setShowBlockConfirm(true)}
                         className="w-full p-6 flex items-center gap-4 text-red-600 bg-red-50 rounded-2xl active:scale-95 transition-transform"
                        >
                          <UserX size={32} />
                          <span className="text-2xl font-black uppercase">Bloquear Amigo (Treino)</span>
                       </button>
                       <button className="w-full p-6 flex items-center gap-4 text-red-600 bg-red-50 rounded-2xl">
                          <AlertCircle size={32} />
                          <span className="text-2xl font-black uppercase">Denunciar Contato</span>
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {isCalling && (
              <div className="absolute inset-0 bg-[#075E54] z-50 flex flex-col items-center justify-between py-20 text-white animate-in slide-in-from-bottom-8">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/40 animate-pulse">
                       A
                    </div>
                    <h2 className="text-4xl font-black">Seu Amigo (Treino)</h2>
                    <p className="text-xl font-bold opacity-80 uppercase tracking-widest">
                       {callTime > 0 ? formatTime(callTime) : 'Chamando...'}
                    </p>
                 </div>

                 <div className="grid grid-cols-3 gap-12 w-full px-12">
                    <div className="flex flex-col items-center gap-3">
                       <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={`p-6 rounded-full transition-all ${isSpeakerOn ? 'bg-white text-[#075E54]' : 'bg-white/10'}`}>
                          <Volume2 size={32} />
                       </button>
                       <span className="font-black text-xs uppercase tracking-tight">Alto-Falante</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <button className="p-6 rounded-full bg-white/10 opacity-30">
                          <Maximize2 size={32} />
                       </button>
                       <span className="font-black text-xs uppercase tracking-tight">Vídeo</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                       <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-full transition-all ${isMuted ? 'bg-white text-[#075E54]' : 'bg-white/10'}`}>
                          {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
                       </button>
                       <span className="font-black text-xs uppercase tracking-tight">Silenciar</span>
                    </div>
                 </div>

                 <button 
                  onClick={() => handleSimAction('end_call')}
                  className="bg-red-500 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white active:scale-90 transition-transform"
                 >
                    <PhoneOff size={48} />
                 </button>
              </div>
            )}

            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                setShowProfileInTraining(true);
                if (trainingTask === 'block') {
                  handleSpeak("Agora desça a tela até o final e toque no botão vermelho escrito Bloquear Amigo.");
                }
              }}>
                <div onClick={(e) => { e.stopPropagation(); setView('home'); }} className="p-2"><ArrowLeft size={24} /></div>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-[#075E54] font-black">A</div>
                <div>
                   <h4 className="font-black text-lg">Amigo (Treino)</h4>
                   <p className="text-[10px] opacity-80 uppercase font-bold">{isBlocked ? 'Bloqueado' : 'Está online agora'}</p>
                </div>
              </div>
              <div className="flex gap-6">
                 {!isBlocked && (
                    <button onClick={() => handleSimAction('start_call')} className="active:scale-90 transition-transform">
                      <Phone size={24} />
                    </button>
                 )}
                 <button onClick={() => {
                    setShowProfileInTraining(true);
                    if (trainingTask === 'block') {
                      handleSpeak("Agora desça a tela até o final e toque no botão vermelho escrito Bloquear Amigo.");
                    }
                 }}><MoreVertical size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
               {simMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-[80%] text-xl font-medium shadow-sm border ${msg.role === 'user' ? 'bg-[#DCF8C6] border-[#DCF8C6] rounded-tr-none' : 'bg-white border-gray-200 rounded-tl-none'}`}>
                       {msg.text}
                    </div>
                 </div>
               ))}
               {isBlocked && (
                 <div className="flex justify-center my-6">
                    <button 
                      onClick={() => handleSimAction('unblock')}
                      className="bg-[#E1F3FB] text-[#1B365D] p-3 px-6 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 border border-blue-200 active:scale-95 transition-transform"
                    >
                       <ShieldCheck size={16} /> Você bloqueou este contato. Toque para desbloquear.
                    </button>
                 </div>
               )}
               <div ref={chatEndRef} />
            </div>

            <div className={`bg-amber-100/80 p-3 flex items-center gap-2 relative border-t border-amber-200 ${isBlocked ? 'opacity-50 grayscale' : ''}`}>
               <button onClick={() => {
                 if(isBlocked) return;
                 const newState = !showAttachmentMenu;
                 setShowAttachmentMenu(newState);
                 if (newState && trainingTask === 'media') {
                   handleSpeak("Agora toque no desenho roxo da galeria para escolher a foto que deseja enviar.");
                 }
               }} className="p-3 text-amber-900 active:scale-90 transition-transform">
                  <Paperclip size={28} />
               </button>
               <div className="flex-1 bg-white rounded-full p-3 px-6 text-lg font-bold border border-amber-200 shadow-inner overflow-hidden">
                  <span className={isBlocked ? 'text-gray-400' : 'text-gray-800'}>
                    {isBlocked ? 'Desbloqueie para enviar mensagens' : 'Escreva uma mensagem...'}
                  </span>
               </div>
               <div className={`p-3 rounded-full text-white shadow-lg ${isBlocked ? 'bg-gray-400' : 'bg-[#075E54]'}`}>
                  <Mic size={28} />
               </div>

               {showAttachmentMenu && (
                 <div className="absolute bottom-20 left-4 bg-white p-6 rounded-[32px] shadow-2xl grid grid-cols-3 gap-8 border-2 border-gray-100 animate-in slide-in-from-bottom-4 z-20">
                    <div onClick={() => { setShowAttachmentMenu(false); handleSimAction('send_photo'); }} className="flex flex-col items-center gap-2 cursor-pointer active:scale-90">
                       <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white"><ImageIcon size={32} /></div>
                       <span className="font-black text-[10px] uppercase tracking-tighter text-gray-600">Galeria</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-30 grayscale cursor-not-allowed">
                       <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white"><Smartphone size={32} /></div>
                       <span className="font-black text-[10px] uppercase tracking-tighter text-gray-600">Documento</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-30 grayscale cursor-not-allowed">
                       <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white"><Phone size={32} /></div>
                       <span className="font-black text-[10px] uppercase tracking-tighter text-gray-600">Contato</span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* OUTRAS VIEWS */}
        {view === 'module' && activeModule && (
          <div className="animate-in slide-in-from-right-8">
            <h2 className="text-3xl font-black mb-8 text-[#1B365D]">{activeModule.title}</h2>
            <div className="space-y-4">
              {activeModule.lessons.map((lesson) => (
                <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setView('lesson'); }} className="w-full bg-white rounded-[32px] p-8 flex items-center justify-between shadow-md active:scale-95 transition-all text-left">
                  <span className="text-xl font-black">{lesson.title}</span>
                  <div className="bg-green-50 p-2 rounded-full text-[#25D366]"><Play size={24} fill="currentColor" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'lesson' && activeLesson && (
          <div className="animate-in zoom-in-95 duration-500">
             <h2 className="text-3xl font-black mb-6 text-[#1B365D]">{activeLesson.title}</h2>
             <div className="bg-white rounded-[40px] p-10 shadow-2xl border-4 border-white mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#25D366]"></div>
                <p className="text-2xl font-bold mb-10 leading-relaxed text-gray-700">"{activeLesson.content}"</p>
                <div className="flex flex-col gap-4">
                   <button onClick={() => handleSpeak(activeLesson.content)} className="w-full bg-blue-500 text-white py-6 rounded-3xl font-black text-xl shadow-lg flex items-center justify-center gap-3 active:scale-95">
                      <Volume2 /> OUVIR EXPLICAÇÃO
                   </button>
                   <button onClick={() => { setView('home'); }} className="w-full bg-[#1B365D] text-white py-6 rounded-3xl font-black text-xl shadow-lg active:scale-95">
                      CONCLUÍDO, ENTENDI!
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'ai_guide' && (
          <div className="flex flex-col h-[78vh] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-right-8 border-2 border-gray-100">
             <div className="bg-[#1B365D] p-8 text-white flex items-center gap-5">
                <Sparkles size={40} className="text-yellow-400" />
                <div>
                   <h2 className="text-2xl font-black">Seu Guia Digital</h2>
                   <p className="font-bold text-green-400 text-xs uppercase tracking-widest">Sempre pronto para ajudar</p>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`p-6 rounded-[32px] text-xl font-medium shadow-sm max-w-[90%] ${msg.role === 'user' ? 'bg-[#1B365D] text-white rounded-tr-none' : 'bg-white border-2 border-gray-100 rounded-tl-none'}`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {isTyping && <div className="flex gap-2 p-4 text-gray-400 font-bold italic animate-pulse">O Guia está pensando...</div>}
                <div ref={chatEndRef} />
             </div>
             <div className="p-6 border-t-2 flex gap-4 bg-white">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Pergunte aqui..." className="flex-1 p-6 bg-gray-100 rounded-3xl font-bold text-xl border-none focus:ring-2 ring-[#25D366]" />
                <button onClick={handleSendMessage} className="bg-[#25D366] text-white p-6 rounded-3xl shadow-lg active:scale-90"><Send size={32} /></button>
             </div>
          </div>
        )}

        {view === 'achievements' && (
          <div className="animate-in zoom-in-95 duration-500">
             <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-widest text-[#1B365D]">Minhas Conquistas</h2>
             <div className="grid gap-6">
                {achievements.map((a) => (
                  <div key={a.id} className={`p-8 rounded-[40px] border-4 flex items-center gap-8 ${a.unlocked ? 'bg-white border-yellow-400 shadow-xl' : 'bg-gray-100 border-gray-200 opacity-40'}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${a.unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                      {React.cloneElement(a.icon as React.ReactElement, { size: 50 })}
                    </div>
                    <div>
                       <h4 className="text-2xl font-black">{a.title}</h4>
                       <p className="text-lg text-gray-500 font-bold">{a.description}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* Nav Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 p-6 flex justify-around items-center z-30 shadow-2xl rounded-t-[40px]">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-2 ${view === 'home' ? 'text-[#25D366]' : 'text-gray-300'}`}>
          <Smartphone size={32} /> <span className="text-[10px] font-black uppercase">Treinar</span>
        </button>
        <button onClick={() => setView('ai_guide')} className={`flex flex-col items-center gap-2 -mt-16 bg-[#25D366] p-5 rounded-full shadow-2xl border-4 border-white ${view === 'ai_guide' ? 'scale-125' : 'text-white'}`}>
          <Sparkles size={36} />
        </button>
        <button onClick={() => setView('achievements')} className={`flex flex-col items-center gap-2 ${view === 'achievements' ? 'text-[#1B365D]' : 'text-gray-300'}`}>
          <Award size={32} /> <span className="text-[10px] font-black uppercase">Prêmios</span>
        </button>
      </nav>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
        .pattern-dots {
          background-image: radial-gradient(#d97706 0.5px, transparent 0.5px);
          background-size: 10px 10px;
          background-color: #fffbeb;
        }
      `}</style>
    </div>
  );
};

export default App;
