const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/products/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update AdminProduct type
content = content.replace(
  "is_active: boolean;",
  "is_active: boolean;\n  printful_variant_id?: string;"
);

// 2. Add state for editing variant ID
content = content.replace(
  "const [editPrice, setEditPrice] = useState<string>('');",
  "const [editPrice, setEditPrice] = useState<string>('');\n  const [editVariantId, setEditVariantId] = useState<string>('');"
);

// 3. Update sync loop formatting to include variant ID
content = content.replace(
  "is_active: is_active",
  "is_active: is_active,\n            printful_variant_id: p.metadata?.printful_variant_id || ''"
);
content = content.replace(
  "is_active: d.metadata?.is_active ?? true",
  "is_active: d.metadata?.is_active ?? true,\n              printful_variant_id: d.metadata?.printful_variant_id || ''"
);

// 4. Update handleStartEdit to prepopulate variant ID
content = content.replace(
  "setEditPrice(p.price.toFixed(2));",
  "setEditPrice(p.price.toFixed(2));\n    setEditVariantId(p.printful_variant_id || '');"
);

// 5. Update handleSavePrice (rename context to handleSave)
content = content.replace(
  "const handleSavePrice = async (id: number) => {",
  "const handleSavePrice = async (id: number) => {\n    const newVariantId = editVariantId;"
);
content = content.replace(
  "updateStorageOrDb(id, { price: newPriceVal });",
  "updateStorageOrDb(id, { price: newPriceVal, printful_variant_id: newVariantId });"
);
content = content.replace(
  "return { ...p, price: newPriceVal };",
  "return { ...p, price: newPriceVal, printful_variant_id: newVariantId };"
);

// 6. Update updateStorageOrDb params
content = content.replace(
  "updates: { stock_count?: number; price?: number; is_active?: boolean }",
  "updates: { stock_count?: number; price?: number; is_active?: boolean; printful_variant_id?: string }"
);

// 7. Store variant ID in metadata
content = content.replace(
  "if (updates.is_active !== undefined) nextMeta.is_active = updates.is_active;",
  "if (updates.is_active !== undefined) nextMeta.is_active = updates.is_active;\n      if (updates.printful_variant_id !== undefined) nextMeta.printful_variant_id = updates.printful_variant_id;"
);

// 8. Add input to UI
const uiSearch = `<div className="flex items-center gap-1 mt-2">`;
const newUI = `
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-1">
                          <span className="text-white/40 font-mono text-[9px] uppercase w-16">Price</span>
                          <span className="text-white/40 font-mono text-xs">€</span>
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded px-1.5 py-0.5 font-mono text-xs text-white w-16 focus:outline-none focus:border-racing-red"
                          />
                        </div>
                        {product.category === 'Merchandise' && (
                          <div className="flex items-center gap-1">
                            <span className="text-white/40 font-mono text-[9px] uppercase w-16">Printful ID</span>
                            <input
                              type="text"
                              value={editVariantId}
                              onChange={(e) => setEditVariantId(e.target.value)}
                              placeholder="e.g. 11342"
                              className="bg-white/5 border border-white/20 rounded px-1.5 py-0.5 font-mono text-xs text-white w-20 focus:outline-none focus:border-racing-red"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleSavePrice(product.id)}
                          className="w-full mt-1 p-1.5 bg-green-500 text-white text-[10px] uppercase font-black tracking-wider rounded hover:bg-green-600 transition-colors flex justify-center items-center gap-2"
                        >
                          <Check size={12} /> Save Changes
                        </button>
                      </div>
`;
// Replace the old edit block (which spans multiple lines) with a regex
content = content.replace(/<div className="flex items-center gap-1 mt-2">[\s\S]*?<\/button>\s*<\/div>/, newUI);

// Add display of Printful ID in read-only mode
const readOnlySearch = `<span className="font-orbitron font-black text-racing-red text-sm">€{product.price.toFixed(2)}</span>`;
const readOnlyNew = `
                        <div className="flex flex-col">
                          <span className="font-orbitron font-black text-racing-red text-sm">€{product.price.toFixed(2)}</span>
                          {product.category === 'Merchandise' && product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-white/40 mt-1">Printful ID: {product.printful_variant_id}</span>
                          )}
                          {product.category === 'Merchandise' && !product.printful_variant_id && (
                            <span className="text-[8px] font-mono text-yellow-500 mt-1">Printful ID: Missing!</span>
                          )}
                        </div>
`;
content = content.replace(readOnlySearch, readOnlyNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched admin products successfully');
