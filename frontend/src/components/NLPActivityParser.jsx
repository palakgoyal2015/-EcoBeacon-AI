import React, { useState } from 'react';

const NLP_RULES = [
  // Transportation
  { pattern: /\b(drove?|driving|car|ride)\b.*?(\d+\.?\d*)\s*(km|kilometer|mile|mi)/i, type: 'transportation', category: 'car', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|kilometer|mile|mi).*\b(drove?|driving|car)\b/i, type: 'transportation', category: 'car', valueIdx: 1 },
  { pattern: /\b(flew?|flight|airplane|plane|air)\b.*?(\d+\.?\d*)\s*(km|kilometer|mile|mi)/i, type: 'transportation', category: 'flight', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|mi).*\b(flew?|flight|plane)\b/i, type: 'transportation', category: 'flight', valueIdx: 1 },
  { pattern: /\b(cycled?|cycling|bike|bicycle|biked)\b.*?(\d+\.?\d*)\s*(km|kilometer|mile|mi)/i, type: 'transportation', category: 'bike', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|mi).*\b(cycled?|bike|bicycle)\b/i, type: 'transportation', category: 'bike', valueIdx: 1 },
  { pattern: /\b(walked?|walking|on foot|strolled?)\b.*?(\d+\.?\d*)\s*(km|kilometer|mile|mi)/i, type: 'transportation', category: 'walking', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|mi).*\b(walked?|walking)\b/i, type: 'transportation', category: 'walking', valueIdx: 1 },
  { pattern: /\b(bus|commute by bus)\b.*?(\d+\.?\d*)\s*(km|mi)/i, type: 'transportation', category: 'bus', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|mi).*\b(bus)\b/i, type: 'transportation', category: 'bus', valueIdx: 1 },
  { pattern: /\b(train|rail|subway|metro)\b.*?(\d+\.?\d*)\s*(km|mi)/i, type: 'transportation', category: 'train', valueIdx: 2 },
  { pattern: /(\d+\.?\d*)\s*(km|mi).*\b(train|rail|metro)\b/i, type: 'transportation', category: 'train', valueIdx: 1 },
  { pattern: /\b(motorcycle|motorbike|moped|scooter)\b.*?(\d+\.?\d*)\s*(km|mi)/i, type: 'transportation', category: 'motorcycle', valueIdx: 2 },
  { pattern: /\b(electric car|ev|tesla|e-car)\b.*?(\d+\.?\d*)\s*(km|mi)/i, type: 'transportation', category: 'electric_car', valueIdx: 2 },

  // Electricity
  { pattern: /(\d+\.?\d*)\s*(kwh|kw-h|kilowatt|units?)\b/i, type: 'electricity', category: 'standard', valueIdx: 1 },
  { pattern: /\b(solar|solar panel)\b.*?(\d+\.?\d*)\s*(kwh|kw)/i, type: 'electricity', category: 'solar', valueIdx: 2 },
  { pattern: /\b(wind|wind energy)\b.*?(\d+\.?\d*)\s*(kwh|kw)/i, type: 'electricity', category: 'wind', valueIdx: 2 },
  { pattern: /\b(used?|consumed?|electricity)\b.*?(\d+\.?\d*)\s*(kwh|kw|units?)/i, type: 'electricity', category: 'standard', valueIdx: 2 },

  // Food
  { pattern: /\b(ate?|eat|had|eaten)\b.*?\b(beef|steak|burger)\b/i, type: 'food', category: 'beef', valueIdx: null, defaultValue: 1 },
  { pattern: /(\d+)\s*(beef|steak)\s*(meal|portion)?/i, type: 'food', category: 'beef', valueIdx: 1 },
  { pattern: /\b(ate?|eat|had)\b.*?\b(meat|chicken|pork|lamb)\b/i, type: 'food', category: 'meat', valueIdx: null, defaultValue: 1 },
  { pattern: /\b(fast food|mcdonald|kfc|burger king|pizza|takeaway)\b/i, type: 'food', category: 'fastfood', valueIdx: null, defaultValue: 1 },
  { pattern: /\b(ate?|eat|had|eaten)\b.*?\b(veg|vegetarian|salad|veggies)\b/i, type: 'food', category: 'veg', valueIdx: null, defaultValue: 1 },
  { pattern: /\b(vegan|plant.based)\b/i, type: 'food', category: 'vegan', valueIdx: null, defaultValue: 1 },
  { pattern: /\b(dairy|milk|cheese|yogurt|butter)\b/i, type: 'food', category: 'dairy', valueIdx: null, defaultValue: 1 },
  { pattern: /\b(ate?|eat|had)\b.*?\b(fish|seafood|salmon|tuna)\b/i, type: 'food', category: 'fish', valueIdx: null, defaultValue: 1 },

  // Shopping
  { pattern: /\b(bought?|purchased?|ordered?)\b.*?(\d+)\s*(item|product|thing)/i, type: 'shopping', category: 'normal', valueIdx: 2 },
  { pattern: /\b(secondhand|second.hand|thrift)\b.*?(\d+)?/i, type: 'shopping', category: 'secondhand', valueIdx: 2, defaultValue: 1 },
  { pattern: /\b(eco.friendly|sustainable|green product)\b.*?(\d+)?/i, type: 'shopping', category: 'eco-friendly', valueIdx: 2, defaultValue: 1 },
  { pattern: /\b(electronics|gadget|appliance|device)\b.*?(\d+)?/i, type: 'shopping', category: 'high-impact', valueIdx: 2, defaultValue: 1 },
];

function parseActivity(text) {
  for (const rule of NLP_RULES) {
    const match = text.trim().match(rule.pattern);
    if (match) {
      let value = null;
      if (rule.valueIdx !== null && match[rule.valueIdx]) {
        value = parseFloat(match[rule.valueIdx]);
      } else if (rule.defaultValue) {
        value = rule.defaultValue;
      }
      if (value !== null && value > 0) {
        return { type: rule.type, category: rule.category, value };
      }
    }
  }
  return null;
}

const CATEGORY_LABELS = {
  car: 'Car', motorcycle: 'Motorcycle', bus: 'Bus', train: 'Train',
  flight: 'Flight', bike: 'Bicycle', walking: 'Walking', electric_car: 'Electric Car',
  standard: 'Standard Grid', solar: 'Solar', wind: 'Wind Energy',
  beef: 'Beef Meal', meat: 'Meat Meal', fish: 'Fish Meal', fastfood: 'Fast Food',
  dairy: 'Dairy-based', veg: 'Vegetarian', vegan: 'Vegan',
  'high-impact': 'High Impact', normal: 'Normal', 'eco-friendly': 'Eco-Friendly', secondhand: 'Secondhand'
};

const TYPE_ICONS = { transportation: '🚗', electricity: '⚡', food: '🍽️', shopping: '🛍️' };

const EXAMPLES = [
  'drove 25km to work',
  'ate a beef burger for lunch',
  'used 8 kWh today',
  'cycled 10km to school',
  'flew 500km for business',
  'bought 2 items online',
  'had a vegan dinner',
  'took the train 30km',
];

export default function NLPActivityParser({ onParsed }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleParse = () => {
    if (!input.trim()) return;
    const parsed = parseActivity(input);
    if (parsed) {
      setResult(parsed);
      setError('');
    } else {
      setResult(null);
      setError('Could not understand that. Try: "drove 15km" or "ate beef burger"');
    }
  };

  const handleApply = () => {
    if (result) {
      onParsed(result);
      setInput('');
      setResult(null);
      setError('');
    }
  };

  const handleExample = (ex) => {
    setInput(ex);
    setShowExamples(false);
    const parsed = parseActivity(ex);
    if (parsed) { setResult(parsed); setError(''); }
  };

  return (
    <div className="card mb-4 border border-indigo-700/40 bg-indigo-950/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <h3 className="text-indigo-300 font-semibold text-sm">AI Natural Language Logger</h3>
        <span className="ml-auto text-xs text-indigo-500 bg-indigo-950/50 px-2 py-0.5 rounded-full">AI Feature</span>
      </div>
      <p className="text-slate-400 text-xs mb-3">Describe your activity in plain English — AI will fill the form for you.</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setResult(null); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleParse()}
          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder='"drove 15km to office" or "ate beef for lunch"'
        />
        <button
          type="button"
          onClick={handleParse}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Parse
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowExamples(s => !s)}
        className="text-indigo-500 text-xs mt-2 hover:text-indigo-400 transition-colors"
      >
        {showExamples ? 'Hide examples ▲' : 'Show examples ▼'}
      </button>

      {showExamples && (
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-colors">
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-amber-400">⚠️ {error}</p>}

      {result && (
        <div className="mt-3 p-3 bg-indigo-900/30 rounded-xl border border-indigo-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">{TYPE_ICONS[result.type]}</span>
            <div>
              <span className="text-white font-medium">{CATEGORY_LABELS[result.category]}</span>
              <span className="text-slate-400 ml-2 text-xs">({result.type})</span>
              <p className="text-indigo-300 text-xs">Value: <strong>{result.value}</strong></p>
            </div>
          </div>
          <button type="button" onClick={handleApply}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
            Apply →
          </button>
        </div>
      )}
    </div>
  );
}
