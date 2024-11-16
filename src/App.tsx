import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { Dices, FileText, History, Moon, Sun, SwitchCamera, Sparkles } from 'lucide-react';

type Mode = 'number' | 'text';
type HistoryItem = {
  timestamp: number;
  type: Mode;
  input: string[];
  output: string[];
};

function App() {
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [mode, setMode] = useState<Mode>('number');
  const [min, setMin] = useState(Cookies.get('min') || '1');
  const [max, setMax] = useState(Cookies.get('max') || '100');
  const [count, setCount] = useState(Cookies.get('count') || '1');
  const [textContent, setTextContent] = useState(Cookies.get('textContent') || '');
  const [result, setResult] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = Cookies.get('history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    Cookies.set('min', min);
    Cookies.set('max', max);
    Cookies.set('count', count);
    Cookies.set('textContent', textContent);
    Cookies.set('history', JSON.stringify(history.slice(-20)));
  }, [min, max, count, textContent, history]);

  const generateRandom = () => {
    setIsGenerating(true);
    let newResult: string[] = [];
    if (mode === 'number') {
      const minNum = parseInt(min);
      const maxNum = parseInt(max);
      const countNum = parseInt(count);
      newResult = Array.from({ length: countNum }, () => 
        Math.floor(Math.random() * (maxNum - minNum + 1) + minNum).toString()
      );
    } else {
      const lines = textContent.split('\n').filter(line => line.trim());
      const countNum = Math.min(parseInt(count), lines.length);
      const shuffled = [...lines].sort(() => Math.random() - 0.5);
      newResult = shuffled.slice(0, countNum);
    }
    
    setResult([]);
    setTimeout(() => {
      setResult(newResult);
      setIsGenerating(false);
      setHistory(prev => [...prev, {
        timestamp: Date.now(),
        type: mode,
        input: mode === 'number' ? [min, max, count] : textContent.split('\n'),
        output: newResult
      }]);
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTextContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Dices className="w-8 h-8" />
            <h1 className="text-2xl font-bold">随机生成器</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <History className="w-6 h-6" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <main>
          <div className="flex justify-center mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(mode === 'number' ? 'text' : 'number')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <SwitchCamera className="w-5 h-5" />
              切换到{mode === 'number' ? '文本' : '数字'}模式
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {mode === 'number' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">最小值</label>
                    <input
                      type="number"
                      value={min}
                      onChange={(e) => setMin(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">最大值</label>
                    <input
                      type="number"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">生成数量</label>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer">
                      <FileText className="w-5 h-5" />
                      上传文本文件
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      placeholder="生成数量"
                      className="w-24 px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                  </div>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="每行输入一个项目..."
                    className="w-full h-40 px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generateRandom}
            disabled={isGenerating}
            className={`w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${isGenerating ? 'animate-pulse' : ''}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              生成随机结果
            </span>
          </motion.button>

          <AnimatePresence mode="wait">
            {result.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-xl animate-pulse" />
                  <div className="relative p-6 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-blue-100 dark:border-blue-900">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                      生成结果
                    </h2>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      {result.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm transition-opacity group-hover:opacity-100 opacity-0" />
                          <div className="relative p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 shadow-sm transform transition-transform duration-200 hover:scale-105 hover:shadow-md">
                            <span className="font-semibold text-lg">{item}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8"
              >
                <h2 className="text-xl font-bold mb-4">历史记录</h2>
                <div className="space-y-4">
                  {history.slice().reverse().map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="px-2 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                          {item.type === 'number' ? '数字模式' : '文本模式'}
                        </span>
                      </div>
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {item.output.map((result, i) => (
                          <div key={i} className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-center">
                            {result}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>Made with Love & Magic for 2312</p>
        </footer>
      </div>
    </div>
  );
}

export default App;