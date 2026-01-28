import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Battery, 
  Settings, 
  HelpCircle, 
  ChevronRight, 
  Plus, 
  Minus,
  Info,
  Truck,
  FileText,
  Menu,
  X
} from 'lucide-react';

// --- 가상 데이터베이스 (스프레드시트 내용 기반 추출) ---
const PRODUCTS = [
  {
    id: "1.280-170.0",
    name: "KM 100/120 R Bp",
    category: "탑승식 건식청소장비",
    price: 37400000,
    origin: "독일",
    status: "판매중",
    specs: { size: "1700x1195x1370mm", width: "730/1000mm", tank: "120L", weight: "498kg", speed: "6km/h" },
    mandatory: [
      { name: "Filter element", pn: "6.414-532.0", qty: 1, price: 438300 },
      { name: "Reversing rolling mill", pn: "6.905-095.0", qty: 1, price: 422900 },
      { name: "Side broom", pn: "6.905-986.0", qty: 1, price: 263300 },
      { name: "Tire wheel drive motor", pn: "6.435-729.0", qty: 1, price: 670800 }
    ],
    options: [
      { name: "Add-on kit side broom left", pn: "2.852-913.0", price: 3274300 },
      { name: "Protection shield", pn: "2.852-828.0", price: 8147000 },
      { name: "Wheel solid rubber non-chalking", pn: "6.435-698.0", price: 925100 }
    ],
    batteries: [
      { label: "옵션 1_트랙션", name: "Battery EXIED 24V-252Ah", pn: "9.711-153.0", price: 0, charger: "9.711-186.0" },
      { label: "옵션 2_리튬", name: "Battery BTS-LFP 24V300Ah", pn: "9.711-036.0", price: 1100000, charger: "9.711-121.0" }
    ]
  },
  {
    id: "1.520-820.0",
    name: "HD 4/10 X Classic *KR",
    category: "고압세척기",
    price: 700000,
    origin: "중국",
    status: "판매중",
    specs: { size: "350x330x880mm", flow: "400 L/H", pressure: "100 Bar", hose: "8m/5m" },
    mandatory: [
      { name: "Classic pistol", pn: "9.751-376.0", qty: 1, price: 119700 },
      { name: "High pressure hose", pn: "9.751-474.0", qty: 1, price: 119100 },
      { name: "Jet pipe 600mm", pn: "9.751-140.0", qty: 1, price: 79600 }
    ],
    options: [
      { name: "Eco!Booster TR 030", pn: "2.113-084.0", price: 182500 },
      { name: "Triple jet nozzle", pn: "4.767-144.0", price: 164000 }
    ]
  },
  {
    id: "1.127-007.0",
    name: "BD 50/50 C Bp Classic",
    category: "보행식 습식청소장비",
    price: 4200000,
    origin: "중국",
    status: "판매중",
    specs: { size: "1170x570x1025mm", width: "510/850mm", tank: "50L", weight: "189kg" },
    mandatory: [
      { name: "Disc brush red 510mm", pn: "4.905-026.0", qty: 1, price: 225500 },
      { name: "Suction bar straight 850mm", pn: "4.777-086.0", qty: 1, price: 445000 }
    ],
    batteries: [
      { label: "옵션 1_무보수", name: "Battery MF 125Ah", pn: "9.711-136.0", price: 672000, charger: "9.711-137.0" },
      { label: "옵션 2_리튬", name: "Battery BTS-LFP 105Ah", pn: "9.711-031.0", price: 1786000, charger: "9.711-127.0" }
    ]
  }
];

const SPARE_PARTS = [
  { pn: "20420220", desc: "Battery Power+ 36/60 *INT", price: 448700, category: "Z2" },
  { pn: "21130840", desc: "Eco!Booster TR 030", price: 182500, category: "Z2" },
  { pn: "26428020", desc: "Add-on kit additional weight BDS", price: 300000, category: "Z2" },
  { pn: "24450430", desc: "Battery Power+ 36/75 *INT", price: 550000, category: "Z2" }
];

const STOCK_DATA = {
  "1.280-170.0": {
    stock: 62,
    pdi: 1,
    inTransit: 0,
    eta: "2026.01.28"
  }
};

// --- 유틸리티 ---
const formatKRW = (val) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.includes(searchQuery) ||
      p.category.includes(searchQuery)
    );
  }, [searchQuery]);

  const currentTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    let sum = selectedProduct.price;
    selectedOptions.forEach(opt => sum += opt.price);
    if (selectedBattery) sum += selectedBattery.price;
    return sum;
  }, [selectedProduct, selectedOptions, selectedBattery]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedOptions([]);
    setSelectedBattery(product.batteries ? product.batteries[0] : null);
    setActiveTab('configurator');
  };

  const toggleOption = (opt) => {
    if (selectedOptions.find(o => o.pn === opt.pn)) {
      setSelectedOptions(selectedOptions.filter(o => o.pn !== opt.pn));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      {/* 사이드바 */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-neutral-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-black font-bold">K</div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">KARCHER Hub</span>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20}/>} label="대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Package size={20}/>} label="제품 카탈로그" active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} expanded={isSidebarOpen} />
          <NavItem icon={<ShoppingCart size={20}/>} label="구성 및 견적" active={activeTab === 'configurator'} onClick={() => setActiveTab('configurator')} expanded={isSidebarOpen} />
          <NavItem icon={<Settings size={20}/>} label="스페어 부품" active={activeTab === 'spare'} onClick={() => setActiveTab('spare')} expanded={isSidebarOpen} />
          <NavItem icon={<Battery size={20}/>} label="배터리 가이드" active={activeTab === 'battery'} onClick={() => setActiveTab('battery')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-2">
          <NavItem icon={<HelpCircle size={20}/>} label="FAQ" onClick={() => setActiveTab('faq')} expanded={isSidebarOpen} />
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 hover:bg-neutral-800 rounded flex items-center justify-center transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('_', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="장비명, 품번 검색..."
                className="pl-10 pr-4 py-2 bg-neutral-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-500">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardView onSelect={handleProductSelect} />}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onSelect={handleProductSelect} />
              ))}
            </div>
          )}
          {activeTab === 'configurator' && (
            <ConfiguratorView 
              product={selectedProduct} 
              selectedOptions={selectedOptions}
              toggleOption={toggleOption}
              selectedBattery={selectedBattery}
              setSelectedBattery={setSelectedBattery}
              total={currentTotal}
            />
          )}
          {activeTab === 'spare' && <SparePartsView />}
          {activeTab === 'battery' && <BatteryGuideView />}
          {activeTab === 'faq' && <FAQView />}
        </div>
      </main>
    </div>
  );
}

// --- 컴포넌트들 ---
function NavItem({ icon, label, active, onClick, expanded }) {
  return (
    <button onClick={onClick} className={`w-full p-4 flex items-center gap-4 transition-colors relative ${active ? 'text-yellow-400 bg-neutral-800 font-medium' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400" />}
      <span className="shrink-0">{icon}</span>
      {expanded && <span className="text-sm">{label}</span>}
    </button>
  );
}

function ProductCard({ product, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-500">{product.category}</span>
        <span className={`text-xs font-bold ${product.status === '판매중' ? 'text-green-600' : 'text-red-500'}`}>{product.status}</span>
      </div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-600 transition-colors">{product.name}</h3>
      <p className="text-sm text-neutral-400 mb-4 font-mono">{product.id}</p>
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">기본 장비가</span>
          <span className="font-semibold">{formatKRW(product.price)}</span>
        </div>
        <div className="flex justify-between text-xs font-mono text-neutral-500 uppercase">
          <span>{product.specs.size || product.specs.pressure}</span>
          <span>{product.origin}</span>
        </div>
      </div>
      <button onClick={() => onSelect(product)} className="w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
        세부 구성 확인 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function DashboardView({ onSelect }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="총 판매 장비" value="124" trend="+5%" color="bg-blue-500" />
        <StatCard label="가용 재고 (주요모델)" value="62" trend="-2%" color="bg-yellow-500" />
        <StatCard label="대기 중 CO" value="18" trend="+12%" color="bg-purple-500" />
        <StatCard label="전월 매출 달성률" value="94%" trend="+1%" color="bg-green-500" />
      </div>
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2"><Truck size={24} /> 주요 제품 재고 현황</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="p-4">품번</th>
                <th className="p-4">제품명</th>
                <th className="p-4">정상재고</th>
                <th className="p-4">입항예정</th>
                <th className="p-4">상태</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-neutral-100">
              {PRODUCTS.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-mono text-neutral-600">{p.id}</td>
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4">{STOCK_DATA[p.id]?.stock || 0}</td>
                  <td className="p-4 text-blue-600">{STOCK_DATA[p.id]?.eta || '-'}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Available</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-3">
        <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
        <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
      </div>
    </div>
  );
}

function ConfiguratorView({ product, selectedOptions, toggleOption, selectedBattery, setSelectedBattery, total }) {
  if (!product) return (
    <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
      <ShoppingCart size={64} className="opacity-20" />
      <p>먼저 카탈로그에서 제품을 선택해 주세요.</p>
    </div>
  );

  return (
    <div className="flex gap-8 flex-col lg:flex-row">
      <div className="flex-1 space-y-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-3xl font-black mb-2">{product.name}</h1>
            <p className="text-neutral-400 font-mono mb-4">{product.id}</p>
            <div className="flex gap-2">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="bg-neutral-800 px-3 py-1 rounded-lg text-xs">
                   <span className="text-neutral-500 mr-2 uppercase">{key}</span>
                   <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right z-10">
            <p className="text-sm text-neutral-400 mb-1">Base Price</p>
            <p className="text-4xl font-bold text-yellow-400">{formatKRW(product.price)}</p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700"><Info size={20} className="text-yellow-500" /> 필수 구성품 (가격 포함)</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            {product.mandatory.map(item => (
              <div key={item.pn} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-neutral-400 font-mono">{item.pn}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{formatKRW(item.price)}</p>
                  <p className="text-neutral-500">수량: {item.qty}EA</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {product.batteries && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700"><Battery size={20} className="text-blue-500" /> 배터리 및 충전기</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.batteries.map(bat => (
                <button key={bat.label} onClick={() => setSelectedBattery(bat)} className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedBattery?.label === bat.label ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-neutral-200 bg-white hover:border-blue-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">{bat.label}</span>
                    <span className="font-bold">{formatKRW(bat.price)}</span>
                  </div>
                  <p className="font-bold text-sm mb-1">{bat.name}</p>
                  <p className="text-xs text-neutral-500 font-mono mb-3">{bat.pn}</p>
                  <div className="text-[10px] text-blue-700 bg-blue-100 p-2 rounded inline-block">충전기: {bat.charger}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700"><Plus size={20} className="text-green-500" /> 추가 옵션</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.options.map(opt => (
              <label key={opt.pn} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedOptions.find(o => o.pn === opt.pn) ? 'bg-green-50 border-green-500 ring-1' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded text-green-500" checked={!!selectedOptions.find(o => o.pn === opt.pn)} onChange={() => toggleOption(opt)} />
                  <div>
                    <p className="text-sm font-bold">{opt.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{opt.pn}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatKRW(opt.price)}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="w-full lg:w-96">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 sticky top-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FileText size={20} /> 실시간 견적</h3>
          <div className="space-y-4 mb-8">
            <SummaryItem label="기본 장비 본체" value={product.price} />
            {selectedBattery && <SummaryItem label={selectedBattery.label} value={selectedBattery.price} highlight="text-blue-600" />}
            {selectedOptions.map(opt => <SummaryItem key={opt.pn} label={opt.name} value={opt.price} />)}
          </div>
          <div className="pt-6 border-t border-neutral-200 space-y-4 text-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-500">총 합계액</span>
              <span className="text-2xl font-black">{formatKRW(total)}</span>
            </div>
            <button className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-bold shadow-lg shadow-yellow-100 hover:bg-yellow-500 transition-all">견적 발행하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight = "text-neutral-900" }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-sm text-neutral-500 line-clamp-1">{label}</p>
      <span className={`text-sm font-bold shrink-0 ${highlight}`}>{formatKRW(value)}</span>
    </div>
  );
}

function SparePartsView() {
  const [search, setSearch] = useState('');
  const filtered = SPARE_PARTS.filter(p => p.desc.toLowerCase().includes(search.toLowerCase()) || p.pn.includes(search));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Spareparts & Accessories</h2></div>
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-neutral-900 text-white text-xs uppercase tracking-wider">
            <tr><th className="p-4">PN</th><th className="p-4">Description</th><th className="p-4">Price</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {filtered.map(part => (
              <tr key={part.pn} className="hover:bg-neutral-50">
                <td className="p-4 font-mono text-neutral-500">{part.pn}</td>
                <td className="p-4 font-bold">{part.desc}</td>
                <td className="p-4 font-semibold">{formatKRW(part.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatteryGuideView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">로컬 배터리 스펙</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm"><h3 className="font-bold border-b pb-2 mb-4">현대 SNS</h3><p className="text-sm text-neutral-500">TNE12-125 (무보수) | 330*171*216mm</p></div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm"><h3 className="font-bold border-b pb-2 mb-4">코리아비티에스</h3><p className="text-sm text-neutral-500">BTS-LFP-24V 105AH (리튬) | 260x310x240mm</p></div>
      </div>
    </div>
  );
}

function FAQView() {
  return <div className="max-w-3xl mx-auto"><h2 className="text-2xl font-bold mb-6">FAQ</h2><div className="bg-white p-6 rounded-2xl border border-neutral-200">시스템 이용 및 데이터 관련 문의는 관리자에게 연락 바랍니다.</div></div>;
}
