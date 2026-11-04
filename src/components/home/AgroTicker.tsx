import React from 'react';
import { Activity, Droplets, Sun, Wind, ShieldAlert, Cpu } from 'lucide-react';

export const AgroTicker: React.FC = () => {
  const highlights = [
    { icon: Droplets, text: 'Tui Far Pek (IoT Drip): Tui sen ral za zela 44-in a tlem zawk', highlight: '-44% Tui' },
    { icon: Activity, text: 'Leilung Nungcha: Fungi leitha a let 17.5-in a pung', highlight: '+1,650% Glomalin' },
    { icon: Sun, text: 'Silvopasture Boruak: Thingzar hnuai ran vulhna 4°C - 7°C-in a vawt zawk', highlight: '7°C Vawt Zawk' },
    { icon: Cpu, text: 'LoRaWAN Wireless Sensor: Km 12 bial chhung solar sensor inbiakpawhna', highlight: '12km Range' },
    { icon: Wind, text: 'Biochar Meihawl Leitha: Kum 1,000 chhung leilung leitha vawngtu', highlight: 'Leitha Nghet' },
    { icon: ShieldAlert, text: 'Damdawi Tur Tel Lova Hrik Venna: Pheromone hmanga theihuan humhimna', highlight: 'Tur A Tel Lo' },
  ];

  return (
    <div className="w-full bg-[#EBF1EA] border-b border-[#D7E3D5] overflow-hidden py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="flex items-center gap-2 pr-4 border-r border-[#B7CEB4] shrink-0 text-[#143520] font-bold text-xs uppercase tracking-wider">
          <Activity className="w-4 h-4 text-[#256B3A] animate-pulse" />
          <span className="hidden sm:inline">Huan & Lo Chanchin Tharlam:</span>
          <span className="sm:hidden">Chanchin:</span>
        </div>

        {/* Scrolling or wrapped ticker items */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 pl-4 text-xs">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap text-[#2D3A31] shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#256B3A] shrink-0" />
                <span>{item.text}</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-[#BFDC28]/50 text-[#143520] font-mono font-bold text-[10px]">
                  {item.highlight}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

